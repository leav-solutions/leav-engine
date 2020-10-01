import {IAmqpService} from 'infra/amqp/amqpService';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import winston from 'winston';
import {IEvent, EventType, IRecordPayload, ILibraryPayload, IValuePayload, Payload} from '../../_types/event';
import * as Joi from '@hapi/joi';
import {IElasticsearchService} from 'infra/elasticsearch/elasticsearchService';
import {isEqual, pick} from 'lodash';
import {IQueryInfos} from '_types/queryInfos';
import {v4 as uuidv4} from 'uuid';
import {Operator} from '../../_types/record';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {ArangoSearchView} from 'arangojs/lib/cjs/view';

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
}

export default function({
    config = null,
    'core.infra.elasticsearch.elasticsearchService': elasticsearchService = null,
    'core.infra.amqp.amqpService': amqpService = null,
    'core.utils.logger': logger = null,
    'core.domain.record': recordDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.eventsManager': eventsManager = null,
    'core.utils': utils = null
}: IDeps): IIndexationManagerDomain {
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
                await elasticsearchService.index(data.libraryId, data.id, data.new);
                break;
            case EventType.RECORD_DELETE:
                data = (event.payload as IRecordPayload).data;
                await elasticsearchService.deleteDocument(data.libraryId, data.id);
                break;
            case EventType.LIBRARY_SAVE:
                data = (event.payload as ILibraryPayload).data;
                const exists = await elasticsearchService.indiceExists(data.id);
                const fullTextAttributes = (await libraryDomain.getLibraryFullTextAttributes(data.id, ctx)).map(
                    fta => fta.id
                );

                if (
                    !exists ||
                    (exists &&
                        !isEqual(
                            (await elasticsearchService.indiceGetMapping(data.id)).sort(),
                            fullTextAttributes.sort()
                        ))
                ) {
                    if (exists) {
                        await elasticsearchService.indiceDelete(data.id);
                    }

                    const records = await recordDomain.find({
                        params: {library: data.id},
                        ctx
                    });

                    for (const record of records.list) {
                        const obj = (
                            await Promise.all(
                                fullTextAttributes.map(async fta => {
                                    const val = await recordDomain.getRecordFieldValue({
                                        library: data.id,
                                        record,
                                        attributeId: fta,
                                        ctx
                                    });

                                    return {
                                        [fta]: Array.isArray(val) ? val.map(v => String(v?.value)) : String(val?.value)
                                    };
                                })
                            )
                        ).reduce((acc, e) => ({...acc, ...e}), {});

                        await elasticsearchService.index(data.id, record.id, obj);
                    }
                }

                break;
            case EventType.LIBRARY_DELETE:
                data = (event.payload as ILibraryPayload).data;
                await elasticsearchService.indiceDelete(data.id);
                break;
            case EventType.VALUE_SAVE:
                data = (event.payload as IValuePayload).data;
                const attrToIndex = await libraryDomain.getLibraryFullTextAttributes(data.libraryId, ctx);

                if (data.attributeId === 'active' && data.value.new === false) {
                    await elasticsearchService.deleteDocument(data.libraryId, data.recordId);
                } else if (data.attributeId === 'active' && data.value.new === true) {
                    const records = await recordDomain.find({
                        params: {library: data.libraryId, filters: [{field: 'id', value: data.recordId}]},
                        ctx
                    });

                    const obj = (
                        await Promise.all(
                            attrToIndex.map(async ati => {
                                const val = await recordDomain.getRecordFieldValue({
                                    library: data.libraryId,
                                    record: records.list[0],
                                    attributeId: ati.id,
                                    ctx
                                });

                                return {
                                    [ati.id]: Array.isArray(val) ? val.map(v => String(v?.value)) : String(val?.value)
                                };
                            })
                        )
                    ).reduce((acc, e) => ({...acc, ...e}), {});

                    await elasticsearchService.index(data.libraryId, data.recordId, obj);
                } else if (attrToIndex.map(a => a.id).includes(data.attributeId)) {
                    await elasticsearchService.update(data.libraryId, data.recordId, {
                        [data.attributeId]: String(data.value.new)
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
            console.log('--INIT INDEXATION MANAGER--');
            console.log('config.indexationManager.queues.events', config.indexationManager.queues.events);
            console.log('config.eventsManager.routingKeys.events', config.eventsManager.routingKeys.events);
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

            const fullTextAttr = (await libraryDomain.getLibraryFullTextAttributes(libraryId, ctx)).map(a => a.id);

            const res = (
                await recordDomain.find({
                    params: {
                        library: libraryId,
                        filters
                    },
                    ctx
                })
            ).list;

            for (const record of res) {
                const obj = (
                    await Promise.all(
                        fullTextAttr.map(async fta => {
                            const val = await recordDomain.getRecordFieldValue({
                                library: libraryId,
                                record,
                                attributeId: fta,
                                ctx
                            });

                            return {[fta]: Array.isArray(val) ? val.map(v => String(v?.value)) : String(val?.value)};
                        })
                    )
                ).reduce((acc, e) => ({...acc, ...e}), {});

                await eventsManager.send(
                    {
                        type: EventType.RECORD_SAVE,
                        data: {
                            id: record.id,
                            libraryId,
                            new: obj
                        }
                    },
                    ctx
                );
            }

            return true;
        }
    };
}
