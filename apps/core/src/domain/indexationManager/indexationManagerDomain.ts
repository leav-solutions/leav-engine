// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Joi from 'joi';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IFindRecordParams, IRecordDomain} from 'domain/record/recordDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {IAmqpService} from '@leav/message-broker';
import {isEqual, pick} from 'lodash';
import {v4 as uuidv4} from 'uuid';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IValue} from '_types/value';
import {AttributeTypes, IAttribute, IAttributeFilterOptions} from '../../_types/attribute';
import {EventAction, IDbEvent, ILibraryPayload, IRecordPayload, IValuePayload} from '../../_types/event';
import {AttributeCondition, Operator} from '../../_types/record';
import {IIndexationService} from '../../infra/indexation/indexationService';

export interface IIndexationManagerDomain {
    init(): Promise<void>;
    indexDatabase(ctx: IQueryInfos, libraryId: string, records?: string[]): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
    'core.domain.record'?: IRecordDomain;
    'core.infra.record'?: IRecordRepo;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.indexation.indexationService'?: IIndexationService;
}

export const CORE_INDEX_FIELD = 'core_index';
export const CORE_INDEX_ANALYZER = 'core_index';
export const CORE_INDEX_VIEW = 'core_index';

export default function ({
    config = null,
    'core.infra.amqpService': amqpService = null,
    'core.domain.record': recordDomain = null,
    'core.infra.record': recordRepo = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.infra.indexation.indexationService': indexationService = null
}: IDeps): IIndexationManagerDomain {
    const _indexRecords = async (findRecordParams: IFindRecordParams, ctx: IQueryInfos): Promise<void> => {
        if (!(await indexationService.isLibraryListed(findRecordParams.library))) {
            await indexationService.listLibrary(findRecordParams.library);
        }

        const fullTextAttributes = await attributeDomain.getLibraryFullTextAttributes(findRecordParams.library, ctx);

        const records = await recordDomain.find({
            params: findRecordParams,
            ctx
        });

        for (const record of records.list) {
            const data = (
                await Promise.all(
                    fullTextAttributes.map(async fta => {
                        let val = await recordDomain.getRecordFieldValue({
                            library: findRecordParams.library,
                            record,
                            attributeId: fta.id,
                            options: {
                                forceGetAllValues: true
                            },
                            ctx
                        });

                        // FIXME: is this statement necessary?
                        if (typeof val === 'undefined') {
                            return {};
                        }

                        val = await _getFormattedValuesAndLabels(fta, val, ctx);

                        const value = Array.isArray(val) ? val.map(v => v?.value).filter(e => e) : val?.value;

                        if (value === null || (Array.isArray(value) && !value.length)) {
                            return {};
                        }

                        return {
                            [fta.id]: typeof value === 'object' ? JSON.stringify(value) : String(value)
                        };
                    })
                )
            ).reduce((acc, e) => ({...acc, ...e}), {});

            await indexationService.indexRecord(findRecordParams.library, record.id, data);
        }
    };

    const _getFormattedValuesAndLabels = async (
        attribute: IAttribute,
        values: IValue | IValue[],
        ctx: IQueryInfos
    ): Promise<IValue | IValue[]> => {
        if (attribute.type === AttributeTypes.TREE) {
            values = Array.isArray(values)
                ? values.map(v => ({
                      ...v,
                      value: v.value?.record
                  }))
                : {...values, value: values.value.record};
        }

        if (
            attribute.type === AttributeTypes.SIMPLE_LINK ||
            attribute.type === AttributeTypes.ADVANCED_LINK ||
            attribute.type === AttributeTypes.TREE
        ) {
            if (Array.isArray(values)) {
                for (const [i, v] of values.entries()) {
                    const recordIdentity = await recordDomain.getRecordIdentity(
                        {id: v.value.id, library: attribute.linked_library || v.value.library},
                        ctx
                    );

                    values[i].value = recordIdentity.label || v.value.id;
                }
            } else {
                const recordIdentity = await recordDomain.getRecordIdentity(
                    {
                        id: values.value.id,
                        library: attribute.linked_library || values.value.library
                    },
                    ctx
                );

                values.value = recordIdentity.label || values.value.id;
            }
        }

        return values;
    };

    const _indexLinkedLibraries = async (libraryId: string, ctx: IQueryInfos, recordId?: string): Promise<void> => {
        const linkedTreeFilters: IAttributeFilterOptions = {linked_tree: libraryId};
        const linkedLibFilters: IAttributeFilterOptions = {linked_library: libraryId};

        // get all attributes with the new library as linked library / linked_tree
        const attributes = (
            await attributeDomain.getAttributes({
                params: {
                    filters: linkedLibFilters
                },
                ctx
            })
        ).list.concat(
            (
                await attributeDomain.getAttributes({
                    params: {
                        filters: linkedTreeFilters
                    },
                    ctx
                })
            ).list
        );

        // get all libraries using theses attributes
        const libraries = [];
        for (const attr of attributes) {
            const res = await libraryDomain.getLibrariesUsingAttribute(attr.id, ctx);

            for (let i = res.length - 1; i >= 0; i--) {
                const fullTextAttributes = await attributeDomain.getLibraryFullTextAttributes(res[i], ctx);
                if (!fullTextAttributes.map(a => a.id).includes(attr.id)) {
                    res.splice(i, 1);
                }
            }

            libraries.push(res);
        }

        const linkedLibraries = [...new Set([].concat(...libraries))];

        for (const ll of linkedLibraries) {
            let filters;

            if (typeof recordId !== 'undefined') {
                let fullTextAttributes = await attributeDomain.getLibraryFullTextAttributes(ll, ctx);
                fullTextAttributes = fullTextAttributes.filter(a => a.linked_library === libraryId);

                filters = fullTextAttributes.map(attr => ({
                    field: attr.id,
                    condition: AttributeCondition.EQUAL,
                    value: recordId
                }));
            }

            await _indexRecords({library: ll, filters}, ctx);
        }
    };

    const _onMessage = async (msg: string): Promise<void> => {
        const event: IDbEvent = JSON.parse(msg);
        const ctx: IQueryInfos = {
            userId: '1',
            queryId: uuidv4()
        };

        try {
            _validateMsg(event);
        } catch (e) {
            console.error(e);
        }

        let data: any;

        switch (event.payload.action) {
            case EventAction.RECORD_SAVE: {
                data = (event.payload as IRecordPayload).data;

                const fullTextAttributes = await attributeDomain.getLibraryFullTextAttributes(data.libraryId, ctx);
                data.new = pick(
                    data.new,
                    fullTextAttributes.map(a => a.id)
                );

                // if simple link replace id by record label
                for (const [key, value] of Object.entries(data.new)) {
                    const attrProps = await attributeDomain.getAttributeProperties({id: key, ctx});

                    if (
                        attrProps.type === AttributeTypes.SIMPLE_LINK ||
                        attrProps.type === AttributeTypes.ADVANCED_LINK
                    ) {
                        const recordIdentity = await recordDomain.getRecordIdentity(
                            {id: value as string, library: attrProps.linked_library},
                            ctx
                        );

                        data.new[key] = recordIdentity.label ? String(recordIdentity.label) : value && String(value);
                    }
                }

                await recordRepo.updateRecord({
                    libraryId: data.libraryId,
                    recordData: {id: data.id, [CORE_INDEX_FIELD]: data.new}
                });

                break;
            }
            case EventAction.LIBRARY_SAVE: {
                data = (event.payload as ILibraryPayload).data;

                if (!isEqual(data.old?.fullTextAttributes?.sort(), data.new?.fullTextAttributes?.sort())) {
                    await _indexRecords({library: data.new.id}, ctx);
                }

                // if label change we re-index all linked libraries
                if (data.new.recordIdentityConf?.label !== data.old?.recordIdentityConf?.label) {
                    await _indexLinkedLibraries(data.new.id, ctx);
                }

                break;
            }
            case EventAction.VALUE_SAVE: {
                data = (event.payload as IValuePayload).data;

                const attrToIndex = await attributeDomain.getLibraryFullTextAttributes(data.libraryId, ctx);

                if (data.attributeId === 'active' && data.value.new.value === true) {
                    await _indexRecords(
                        {
                            library: data.libraryId,
                            filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: data.recordId}]
                        },
                        ctx
                    );
                } else if (attrToIndex.map(a => a.id).includes(data.attributeId)) {
                    const attr = attrToIndex[await attrToIndex.map(a => a.id).indexOf(data.attributeId)];

                    // get format value(s)
                    data.value.new = await recordDomain.getRecordFieldValue({
                        library: data.libraryId,
                        record: {id: data.recordId},
                        attributeId: data.attributeId,
                        ctx
                    });

                    data.value.new = await _getFormattedValuesAndLabels(attr, data.value.new, ctx);

                    await recordRepo.updateRecord({
                        libraryId: data.libraryId,
                        recordData: {
                            id: data.recordId,
                            [CORE_INDEX_FIELD]: {
                                [data.attributeId]: Array.isArray(data.value.new)
                                    ? data.value.new.map(v => v.value)
                                    : data.value.new.value
                            }
                        }
                    });
                }

                const library = await libraryDomain.getLibraryProperties(data.libraryId, ctx);

                // if new value of the attribute is the label of the library
                // we have to re-index all linked libraries
                if (library.recordIdentityConf?.label === data.attributeId) {
                    await _indexLinkedLibraries(data.libraryId, ctx, data.recordId);
                }

                break;
            }
            case EventAction.VALUE_DELETE: {
                data = (event.payload as IValuePayload).data;

                const attrProps = await attributeDomain.getAttributeProperties({id: data.attributeId, ctx});

                let values: IValue[];

                if (attrProps.multiple_values) {
                    values = (await recordDomain.getRecordFieldValue({
                        library: data.libraryId,
                        record: {id: data.recordId},
                        attributeId: data.attributeId,
                        ctx
                    })) as IValue[];

                    values = (await _getFormattedValuesAndLabels(attrProps, values, ctx)) as IValue[];
                }

                await recordRepo.updateRecord({
                    libraryId: data.libraryId,
                    recordData: {
                        id: data.recordId,
                        [CORE_INDEX_FIELD]: {
                            [data.attributeId]: values?.map((v: IValue) => String(v.value)) ?? null
                        }
                    }
                });

                const library = await libraryDomain.getLibraryProperties(data.libraryId, ctx);

                // if attribute updated/deleted is the label of the library
                // we have to re-index all linked libraries
                if (library.recordIdentityConf?.label === data.attributeId) {
                    await _indexLinkedLibraries(data.libraryId, ctx, data.recordId);
                }

                break;
            }
        }
    };

    const _validateMsg = (msg: IDbEvent) => {
        const msgBodySchema = Joi.object().keys({
            time: Joi.number().required(),
            userId: Joi.string().required(),
            payload: Joi.object()
                .keys({
                    action: Joi.string()
                        .valid(...Object.values(EventAction))
                        .required(),
                    data: Joi.object().required()
                })
                .required()
        });

        const isValid = msgBodySchema.validate(msg);

        if (!!isValid.error) {
            const errorMsg = isValid.error.details.map(e => e.message).join(', ');
            throw new Error(errorMsg);
        }
    };

    return {
        async init(): Promise<void> {
            // Init rabbitmq
            await amqpService.consumer.channel.assertQueue(config.indexationManager.queues.events);
            await amqpService.consumer.channel.bindQueue(
                config.indexationManager.queues.events,
                config.amqp.exchange,
                config.eventsManager.routingKeys.data_events
            );

            await amqpService.consume(
                config.indexationManager.queues.events,
                config.eventsManager.routingKeys.data_events,
                _onMessage
            );

            await indexationService.init();
        },
        async indexDatabase(ctx: IQueryInfos, libraryId: string, records?: string[]): Promise<void> {
            // if records are undefined we re-index all library's records

            const filters = records
                ? records.reduce((acc, id) => {
                      acc.push({field: 'id', condition: AttributeCondition.EQUAL, value: id});
                      if (records.length > 1) {
                          acc.push({operator: Operator.OR});
                      }
                      return acc;
                  }, [])
                : [];

            await _indexRecords({library: libraryId, filters}, ctx);
        }
    };
}
