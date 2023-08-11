// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IValue} from '_types/value';
import * as amqp from 'amqplib';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IFindRecordParams, IRecordDomain} from 'domain/record/recordDomain';
import Joi from 'joi';
import {isEqual, difference, intersectionBy} from 'lodash';
import {v4 as uuidv4} from 'uuid';
import {AttributeTypes, IAttribute} from '../../_types/attribute';
import {EventAction, IDbEvent, ILibraryPayload, IRecordPayload, IValuePayload} from '../../_types/event';
import {AttributeCondition, IRecord, Operator} from '../../_types/record';
import {IIndexationService} from '../../infra/indexation/indexationService';

export interface IIndexationManagerDomain {
    init(): Promise<void>;
    indexDatabase(ctx: IQueryInfos, libraryId: string, records?: string[]): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
    'core.domain.record'?: IRecordDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.indexation.indexationService'?: IIndexationService;
}

export default function ({
    config = null,
    'core.infra.amqpService': amqpService = null,
    'core.domain.record': recordDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.infra.indexation.indexationService': indexationService = null
}: IDeps): IIndexationManagerDomain {
    const _indexRecords = async (
        findRecordParams: IFindRecordParams,
        ctx: IQueryInfos,
        attributes?: {up?: string[]; del?: string[]}
    ): Promise<void> => {
        if (!(await indexationService.isLibraryListed(findRecordParams.library))) {
            await indexationService.listLibrary(findRecordParams.library);
        }

        const fullTextLibraryAttributes = await attributeDomain.getLibraryFullTextAttributes(
            findRecordParams.library,
            ctx
        );

        const attributesToEdit = {up: [], del: []};
        if (attributes) {
            const libraryAttributes = await attributeDomain.getLibraryAttributes(findRecordParams.library, ctx);
            attributesToEdit.up = fullTextLibraryAttributes.filter(a => attributes.up?.includes(a.id));
            attributesToEdit.del = libraryAttributes.filter(a => attributes.del?.includes(a.id));
        } else {
            attributesToEdit.up = fullTextLibraryAttributes;
            attributesToEdit.del = [];
        }

        const _toUp = async (record: IRecord, attribute: IAttribute) => {
            let val = await recordDomain.getRecordFieldValue({
                library: findRecordParams.library,
                record,
                attributeId: attribute.id,
                options: {
                    forceGetAllValues: true
                },
                ctx
            });

            // FIXME: is this statement necessary?
            if (typeof val === 'undefined') {
                return {};
            }

            val = await _getFormattedValuesAndLabels(attribute, val, ctx);

            const value = Array.isArray(val) ? val.map(v => v?.value).filter(e => e) : val?.value;

            if (value === null || (Array.isArray(value) && !value.length)) {
                return {[attribute.id]: null};
            }

            return {
                [attribute.id]: typeof value === 'object' ? JSON.stringify(value) : String(value)
            };
        };

        const records = await recordDomain.find({
            params: findRecordParams,
            ctx
        });

        for (const record of records.list) {
            const data = (await Promise.all([...attributesToEdit.up.map(async a => _toUp(record, a))]))
                .concat(attributesToEdit.del.map(a => ({[a.id]: null})))
                .reduce((acc, e) => ({...acc, ...e}), {});

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

    const _indexLinkedLibraries = async (libraryId: string, ctx: IQueryInfos, toRecordId?: string): Promise<void> => {
        // get all attributes with the new library as linked library / linked_tree
        const attributesToUpdate = (
            await attributeDomain.getAttributes({
                params: {
                    filters: {linked_library: libraryId}
                },
                ctx
            })
        ).list.concat(
            (
                await attributeDomain.getAttributes({
                    params: {
                        filters: {linked_tree: libraryId}
                    },
                    ctx
                })
            ).list
        );

        const libs = (await libraryDomain.getLibraries({ctx})).list;

        for (const l of libs) {
            const intersections = intersectionBy(l.fullTextAttributes, attributesToUpdate, 'id');

            if (intersections.length) {
                let filters;

                if (typeof toRecordId !== 'undefined') {
                    filters = intersections.map(a => ({
                        field: `${a.id}.${a.linked_tree ? `${libraryId}.` : ''}id`,
                        condition: AttributeCondition.EQUAL,
                        value: toRecordId
                    }));
                }

                await _indexRecords({library: l.id, filters}, ctx, {up: intersections.map(a => a.id)});
            }
        }
    };

    const _onMessage = async (msg: amqp.ConsumeMessage): Promise<void> => {
        amqpService.consumer.channel.ack(msg);

        const event: IDbEvent = JSON.parse(msg.content.toString());
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

                await _indexRecords(
                    {
                        library: data.libraryId,
                        filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: data.id}]
                    },
                    ctx
                );

                break;
            }
            case EventAction.LIBRARY_SAVE: {
                data = (event.payload as ILibraryPayload).data;

                const attrsToDel = difference(data.old?.fullTextAttributes, data.new?.fullTextAttributes) as string[];
                const attrsToAdd = difference(data.new?.fullTextAttributes, data.old?.fullTextAttributes) as string[];

                if (!isEqual(data.old?.fullTextAttributes?.sort(), data.new?.fullTextAttributes?.sort())) {
                    await _indexRecords({library: data.new.id}, ctx, {up: attrsToAdd, del: attrsToDel});
                }

                // if label change we re-index all linked libraries
                if (data.new.recordIdentityConf?.label !== data.old?.recordIdentityConf?.label) {
                    await _indexLinkedLibraries(data.new.id, ctx);
                }

                break;
            }
            case EventAction.VALUE_SAVE: {
                data = (event.payload as IValuePayload).data;

                const fullTextAttributes = await attributeDomain.getLibraryFullTextAttributes(data.libraryId, ctx);

                const isActivated = data.attributeId === 'active' && data.value.new.value === true;
                const isAttrToIndex = fullTextAttributes.map(a => a.id).includes(data.attributeId);

                if (isActivated || isAttrToIndex) {
                    await _indexRecords(
                        {
                            library: data.libraryId,
                            filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: data.recordId}]
                        },
                        ctx,
                        isActivated || !isAttrToIndex ? null : {up: [data.attributeId]}
                    );
                }

                // if the new attribute's value is the label of the library
                // we have to re-index all linked libraries
                const library = await libraryDomain.getLibraryProperties(data.libraryId, ctx);
                if (library.recordIdentityConf?.label === data.attributeId) {
                    await _indexLinkedLibraries(data.libraryId, ctx, data.recordId);
                }

                break;
            }
            case EventAction.VALUE_DELETE: {
                data = (event.payload as IValuePayload).data;

                const attrProps = await attributeDomain.getAttributeProperties({id: data.attributeId, ctx});

                await _indexRecords(
                    {
                        library: data.libraryId,
                        filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: data.recordId}]
                    },
                    ctx,
                    attrProps.multiple_values ? {up: [data.attributeId]} : {del: [data.attributeId]}
                );

                // if the updated/deleted attribute is the label of the library
                // we have to re-index all linked libraries
                const library = await libraryDomain.getLibraryProperties(data.libraryId, ctx);
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
            emitter: Joi.string().required(),
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
