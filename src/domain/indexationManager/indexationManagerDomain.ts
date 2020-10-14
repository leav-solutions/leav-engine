import {IAmqpService} from 'infra/amqp/amqpService';
import {IRecordDomain, IFindRecordParams} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import winston from 'winston';
import {IEvent, EventType, IRecordPayload, ILibraryPayload, IValuePayload} from '../../_types/event';
import {IValue} from '../../_types/value';
import * as Joi from '@hapi/joi';
import {IElasticsearchService} from 'infra/elasticsearch/elasticsearchService';
import {isEqual, pick} from 'lodash';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeTypes, IAttribute} from '../../_types/attribute';
import {v4 as uuidv4} from 'uuid';
import {Operator, IRecord} from '../../_types/record';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';

export interface IIndexationManagerDomain {
    init(): Promise<void>;
    indexDatabase(ctx: IQueryInfos, libraryId: string, records?: string[]): Promise<boolean>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.elasticsearch.elasticsearchService'?: IElasticsearchService;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.infra.amqp.amqpService'?: IAmqpService;
    'core.utils.logger'?: winston.Winston;
    'core.domain.record'?: IRecordDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.utils'?: IUtils;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.value'?: IValueDomain;
}

export default function({
    config = null,
    'core.infra.elasticsearch.elasticsearchService': elasticsearchService = null,
    'core.infra.amqp.amqpService': amqpService = null,
    'core.utils.logger': logger = null,
    'core.domain.record': recordDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.eventsManager': eventsManager = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.value': valueDomain = null,
    'core.utils': utils = null
}: IDeps): IIndexationManagerDomain {
    const _indexRecords = async (findRecordParams: IFindRecordParams, ctx: IQueryInfos): Promise<void> => {
        const records = await recordDomain.find({
            params: findRecordParams,
            ctx
        });

        const fullTextAttributes = await libraryDomain.getLibraryFullTextAttributes(findRecordParams.library, ctx);

        for (const record of records.list) {
            const data = (
                await Promise.all(
                    fullTextAttributes.map(async fta => {
                        const val = await recordDomain.getRecordFieldValue({
                            library: findRecordParams.library,
                            record,
                            attributeId: fta.id,
                            ctx
                        });

                        // if simple link replace id by record label
                        if (typeof fta.linked_library !== 'undefined') {
                            const recordIdentity = await recordDomain.getRecordIdentity(
                                {id: (val as IValue).value.id, library: fta.linked_library},
                                ctx
                            );

                            (val as IValue).value = recordIdentity.label || (val as IValue).value.id;
                        }

                        return {
                            [fta.id]: Array.isArray(val)
                                ? val.map(v => v?.value && String(v?.value))
                                : val?.value && String(val?.value)
                        };
                    })
                )
            ).reduce((acc, e) => ({...acc, ...e}), {});

            await elasticsearchService.index(findRecordParams.library, record.id, data);
        }
    };

    const _onMessage = async (msg: string): Promise<void> => {
        const event: IEvent = JSON.parse(msg);
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

        switch (event.payload.type) {
            case EventType.RECORD_SAVE:
                data = (event.payload as IRecordPayload).data;

                // if simple link replace id by record label
                for (const [key, value] of Object.entries(data.new)) {
                    const attrProps = await attributeDomain.getAttributeProperties({id: key, ctx});

                    if (typeof attrProps.linked_library !== 'undefined') {
                        const recordIdentity = await recordDomain.getRecordIdentity(
                            {id: value as string, library: attrProps.linked_library},
                            ctx
                        );

                        data.new[key] = recordIdentity.label ? String(recordIdentity.label) : value && String(value);
                    }
                }

                await elasticsearchService.index(data.libraryId, data.id, data.new);
                break;
            case EventType.RECORD_DELETE:
                data = (event.payload as IRecordPayload).data;
                await elasticsearchService.deleteDocument(data.libraryId, data.id);
                break;
            case EventType.LIBRARY_SAVE:
                data = (event.payload as ILibraryPayload).data;

                const exists = await elasticsearchService.indiceExists(data.new.id);
                const fullTextAttributes = await libraryDomain.getLibraryFullTextAttributes(data.new.id, ctx);

                if (
                    !exists ||
                    (exists &&
                        !isEqual(
                            (await elasticsearchService.indiceGetMapping(data.new.id)).sort(),
                            fullTextAttributes.map(fta => fta.id).sort()
                        ))
                ) {
                    if (exists) {
                        await elasticsearchService.indiceDelete(data.new.id);
                    }
                    await _indexRecords({library: data.new.id}, ctx);
                }

                // if label change we re-index all linked libraries
                if (
                    typeof data.old !== 'undefined' &&
                    data.new?.recordIdentityConf.label !== data.old?.recordIdentityConf.label
                ) {
                    const attrs = await attributeDomain.getAttributes({
                        params: {
                            filters: {linked_library: data.new.id}
                        },
                        ctx
                    });

                    let libraries = [];
                    for (const attr of attrs.list) {
                        const res = await libraryDomain.getLibrariesUsingAttribute(attr.id, ctx);
                        libraries.push(res);
                    }

                    libraries = [...new Set([].concat(...libraries))];

                    for (const library of libraries) {
                        await _indexRecords({library}, ctx);
                    }
                }

                break;
            case EventType.LIBRARY_DELETE:
                data = (event.payload as ILibraryPayload).data;
                await elasticsearchService.indiceDelete(data.old.id);
                break;
            case EventType.VALUE_SAVE:
                data = (event.payload as IValuePayload).data;

                const attrToIndex = await libraryDomain.getLibraryFullTextAttributes(data.libraryId, ctx);

                if (data.attributeId === 'active' && data.value.new === false) {
                    await elasticsearchService.deleteDocument(data.libraryId, data.recordId);
                } else if (data.attributeId === 'active' && data.value.new === true) {
                    await _indexRecords({library: data.libraryId, filters: [{field: 'id', value: data.recordId}]}, ctx);
                } else if (attrToIndex.map(a => a.id).includes(data.attributeId)) {
                    // if simple link replace id by record label
                    const attr = attrToIndex[await attrToIndex.map(a => a.id).indexOf(data.attributeId)];
                    if (typeof attr.linked_library !== 'undefined') {
                        const recordIdentity = await recordDomain.getRecordIdentity(
                            {id: String(data.value.new), library: attr.linked_library},
                            ctx
                        );
                        data.value.new = recordIdentity.label || String(data.value.new);
                    }

                    await elasticsearchService.update(data.libraryId, data.recordId, {
                        [data.attributeId]: data.value.new
                    });
                }

                break;
            case EventType.VALUE_DELETE:
                data = (event.payload as IValuePayload).data;

                if (!!data.value) {
                    await elasticsearchService.update(data.libraryId, data.recordId, {
                        [data.attributeId]: String(data.value.new)
                    });
                } else {
                    await elasticsearchService.delete(data.libraryId, data.recordId, data.attributeId);
                }

                break;
        }
    };

    const _validateMsg = (msg: IEvent) => {
        const msgBodySchema = Joi.object().keys({
            time: Joi.number().required(),
            userId: Joi.string().required(),
            payload: Joi.object()
                .keys({
                    type: Joi.string()
                        .valid(...Object.values(EventType))
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
            await amqpService.amqpConn.channel.assertQueue(config.indexationManager.queues.events);
            await amqpService.amqpConn.channel.bindQueue(
                config.indexationManager.queues.events,
                config.amqp.exchange,
                config.eventsManager.routingKeys.events
            );

            return amqpService.consume(
                config.indexationManager.queues.events,
                config.eventsManager.routingKeys.events,
                _onMessage,
                config.indexationManager.prefetch
            );
        },
        async indexDatabase(ctx: IQueryInfos, libraryId: string, records?: string[]): Promise<boolean> {
            // if records are undefined we re-index all library's records

            const filters = records
                ? records.reduce((acc, id) => {
                      acc.push({field: 'id', value: id});
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
