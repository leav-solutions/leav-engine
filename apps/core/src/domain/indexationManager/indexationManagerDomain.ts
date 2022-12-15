// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Joi from 'joi';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IFindRecordParams, IRecordDomain} from 'domain/record/recordDomain';
import {IAmqpService} from '@leav/message-broker';
import {IElasticsearchService} from 'infra/elasticsearch/elasticsearchService';
import {isEqual, pick} from 'lodash';
import {v4 as uuidv4} from 'uuid';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IValue} from '_types/value';
import {AttributeTypes, IAttribute, IAttributeFilterOptions} from '../../_types/attribute';
import {EventAction, IDbEvent, ILibraryPayload, IRecordPayload, IValuePayload} from '../../_types/event';
import {AttributeCondition, Operator} from '../../_types/record';

export interface IIndexationManagerDomain {
    init(): Promise<void>;
    indexDatabase(ctx: IQueryInfos, libraryId: string, records?: string[]): Promise<boolean>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.elasticsearch.elasticsearchService'?: IElasticsearchService;
    'core.infra.amqpService'?: IAmqpService;
    'core.domain.record'?: IRecordDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.attribute'?: IAttributeDomain;
}

export default function ({
    config = null,
    'core.infra.elasticsearch.elasticsearchService': elasticsearchService = null,
    'core.infra.amqpService': amqpService = null,
    'core.domain.record': recordDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.attribute': attributeDomain = null
}: IDeps): IIndexationManagerDomain {
    const _indexRecords = async (findRecordParams: IFindRecordParams, ctx: IQueryInfos): Promise<void> => {
        const records = await recordDomain.find({
            params: findRecordParams,
            ctx
        });

        const fullTextAttributes = await attributeDomain.getLibraryFullTextAttributes(findRecordParams.library, ctx);

        for (const record of records.list) {
            const data = (
                await Promise.all(
                    fullTextAttributes.map(async fta => {
                        let val = await recordDomain.getRecordFieldValue({
                            library: findRecordParams.library,
                            record,
                            attributeId: fta.id,
                            ctx
                        });

                        if (typeof val === 'undefined') {
                            return {};
                        }

                        val = await _getFormattedValuesAndLabels(fta, val, ctx);

                        return {
                            [fta.id]: Array.isArray(val)
                                ? val.map(v => v?.value && String(v?.value))
                                : val?.value && String(val?.value)
                        };
                    })
                )
            ).reduce((acc, e) => ({...acc, ...e}), {});

            await elasticsearchService.indexData(findRecordParams.library, record.id, data);
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

                await elasticsearchService.indexData(data.libraryId, data.id, data.new);

                break;
            }
            case EventAction.RECORD_DELETE: {
                data = (event.payload as IRecordPayload).data;

                await elasticsearchService.deleteDocument(data.libraryId, data.id);

                break;
            }
            case EventAction.LIBRARY_SAVE: {
                data = (event.payload as ILibraryPayload).data;

                const exists = await elasticsearchService.indiceExists(data.new.id);

                const mappings = data.new?.fullTextAttributes?.reduce((acc, attr) => {
                    acc[attr] = {
                        type: 'wildcard'
                    };

                    return acc;
                }, {});

                if (exists && !isEqual(data.old?.fullTextAttributes?.sort(), data.new?.fullTextAttributes?.sort())) {
                    await elasticsearchService.indiceUpdateMapping(data.new.id, mappings);
                    await _indexRecords({library: data.new.id}, ctx);
                } else if (!exists) {
                    await elasticsearchService.indiceCreate(data.new.id, mappings);
                    await _indexRecords({library: data.new.id}, ctx);
                }

                // if label change we re-index all linked libraries
                if (data.new.recordIdentityConf?.label !== data.old?.recordIdentityConf?.label) {
                    await _indexLinkedLibraries(data.new.id, ctx);
                }

                break;
            }
            case EventAction.LIBRARY_DELETE: {
                data = (event.payload as ILibraryPayload).data;

                await elasticsearchService.indiceDelete(data.old.id);
                break;
            }
            case EventAction.VALUE_SAVE: {
                data = (event.payload as IValuePayload).data;

                const attrToIndex = await attributeDomain.getLibraryFullTextAttributes(data.libraryId, ctx);

                if (data.attributeId === 'active' && data.value.new.value === false) {
                    await elasticsearchService.deleteDocument(data.libraryId, data.recordId);
                } else if (data.attributeId === 'active' && data.value.new.value === true) {
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

                    await elasticsearchService.updateData(data.libraryId, data.recordId, {
                        [data.attributeId]: Array.isArray(data.value.new)
                            ? data.value.new.map(v => v.value)
                            : data.value.new.value
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

                if (attrProps.multiple_values) {
                    let values = await recordDomain.getRecordFieldValue({
                        library: data.libraryId,
                        record: {id: data.recordId},
                        attributeId: data.attributeId,
                        ctx
                    });

                    values = (await _getFormattedValuesAndLabels(attrProps, values, ctx)) as IValue[];

                    await elasticsearchService.updateData(data.libraryId, data.recordId, {
                        [data.attributeId]: values.map(v => String(v.value))
                    });
                } else {
                    await elasticsearchService.deleteData(data.libraryId, data.recordId, data.attributeId);
                }

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
            await amqpService.consumer.channel.assertQueue(config.indexationManager.queues.events);
            await amqpService.consumer.channel.bindQueue(
                config.indexationManager.queues.events,
                config.amqp.exchange,
                config.eventsManager.routingKeys.data_events
            );

            return amqpService.consume(
                config.indexationManager.queues.events,
                config.eventsManager.routingKeys.data_events,
                _onMessage
            );
        },
        async indexDatabase(ctx: IQueryInfos, libraryId: string, records?: string[]): Promise<boolean> {
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

            return true;
        }
    };
}
