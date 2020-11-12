import {IAmqpService} from 'infra/amqp/amqpService';
import {IRecordDomain, IFindRecordParams} from 'domain/record/recordDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import * as Config from '_types/config';
import {IEvent, EventType, IRecordPayload, ILibraryPayload, IValuePayload} from '../../_types/event';
import * as Joi from '@hapi/joi';
import {IElasticsearchService} from 'infra/elasticsearch/elasticsearchService';
import {isEqual, pick} from 'lodash';
import {IQueryInfos} from '_types/queryInfos';
import {v4 as uuidv4} from 'uuid';
import {Operator} from '../../_types/record';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {AttributeTypes} from '../../_types/attribute';
import {IValueDomain} from 'domain/value/valueDomain';

export interface IIndexationManagerDomain {
    init(): Promise<void>;
    indexDatabase(ctx: IQueryInfos, libraryId: string, records?: string[]): Promise<boolean>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.elasticsearch.elasticsearchService'?: IElasticsearchService;
    'core.infra.amqp.amqpService'?: IAmqpService;
    'core.domain.record'?: IRecordDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.value'?: IValueDomain;
}

export default function({
    config = null,
    'core.infra.elasticsearch.elasticsearchService': elasticsearchService = null,
    'core.infra.amqp.amqpService': amqpService = null,
    'core.domain.record': recordDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.value': valueDomain = null
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

                        if (fta.type === AttributeTypes.SIMPLE_LINK || fta.type === AttributeTypes.ADVANCED_LINK) {
                            if (Array.isArray(val)) {
                                for (const v of val) {
                                    const recordIdentity = await recordDomain.getRecordIdentity(
                                        {id: v.value.id, library: fta.linked_library},
                                        ctx
                                    );
                                    v.value = recordIdentity.label || v.value.id;
                                }
                            } else {
                                const recordIdentity = await recordDomain.getRecordIdentity(
                                    {id: val.value.id, library: fta.linked_library},
                                    ctx
                                );

                                val.value = recordIdentity.label || val.value.id;
                            }
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

    const _getLinkedLibraries = async (library: string, ctx: IQueryInfos): Promise<string[]> => {
        // get all attributes with the new library as linked library
        const attrs = await attributeDomain.getAttributes({
            params: {
                filters: {linked_library: library}
            },
            ctx
        });

        // get all libraries using theses attributes
        const libraries = [];
        for (const attr of attrs.list) {
            const res = await libraryDomain.getLibrariesUsingAttribute(attr.id, ctx);

            for (let i = res.length - 1; i >= 0; i--) {
                const fullTextAttributes = await libraryDomain.getLibraryFullTextAttributes(res[i], ctx);
                if (!fullTextAttributes.map(a => a.id).includes(attr.id)) {
                    res.splice(i, 1);
                }
            }

            libraries.push(res);
        }

        return [...new Set([].concat(...libraries))];
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
            case EventType.RECORD_SAVE: {
                data = (event.payload as IRecordPayload).data;

                const fullTextAttributes = await libraryDomain.getLibraryFullTextAttributes(data.libraryId, ctx);
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

                await elasticsearchService.index(data.libraryId, data.id, data.new);
                break;
            }
            case EventType.RECORD_DELETE: {
                data = (event.payload as IRecordPayload).data;
                await elasticsearchService.deleteDocument(data.libraryId, data.id);
                break;
            }
            case EventType.LIBRARY_SAVE: {
                data = (event.payload as ILibraryPayload).data;

                const exists = await elasticsearchService.indiceExists(data.new.id);

                if (
                    !exists ||
                    (exists && !isEqual(data.old.fullTextAttributes.sort(), data.new.fullTextAttributes.sort()))
                ) {
                    if (exists) {
                        await elasticsearchService.indiceDelete(data.new.id);
                    }

                    await _indexRecords({library: data.new.id}, ctx);
                }

                // if label change we re-index all linked libraries
                if (data.new.recordIdentityConf?.label !== data.old?.recordIdentityConf?.label) {
                    const linkedLibraries = await _getLinkedLibraries(data.new.id, ctx);

                    for (const ll of linkedLibraries) {
                        await _indexRecords({library: ll}, ctx);
                    }
                }

                break;
            }
            case EventType.LIBRARY_DELETE: {
                data = (event.payload as ILibraryPayload).data;

                await elasticsearchService.indiceDelete(data.old.id);
                break;
            }
            case EventType.VALUE_SAVE: {
                data = (event.payload as IValuePayload).data;

                const attrToIndex = await libraryDomain.getLibraryFullTextAttributes(data.libraryId, ctx);

                if (data.attributeId === 'active' && data.value.new === false) {
                    await elasticsearchService.deleteDocument(data.libraryId, data.recordId);
                } else if (data.attributeId === 'active' && data.value.new === true) {
                    await _indexRecords({library: data.libraryId, filters: [{field: 'id', value: data.recordId}]}, ctx);
                } else if (attrToIndex.map(a => a.id).includes(data.attributeId)) {
                    // if simple link replace id by record label
                    const attr = attrToIndex[await attrToIndex.map(a => a.id).indexOf(data.attributeId)];
                    if (attr.type === AttributeTypes.SIMPLE_LINK || attr.type === AttributeTypes.ADVANCED_LINK) {
                        if (Array.isArray(data.value.new)) {
                            for (const v of data.value.new) {
                                const recordIdentity = await recordDomain.getRecordIdentity(
                                    {id: v.value.id, library: attr.linked_library},
                                    ctx
                                );
                                v.value = recordIdentity.label || v.value.id;
                            }
                        } else {
                            const recordIdentity = await recordDomain.getRecordIdentity(
                                {id: String(data.value.new), library: attr.linked_library},
                                ctx
                            );
                            data.value.new = recordIdentity.label || String(data.value.new);
                        }
                    }

                    await elasticsearchService.update(data.libraryId, data.recordId, {
                        [data.attributeId]: data.value.new
                    });
                }

                // FIXME: A voir pour les actives
                const library = await libraryDomain.getLibraryProperties(data.libraryId, ctx);

                // if new value of the attribute is the label of the library
                // we have to re-index all linked libraries
                if (library.recordIdentityConf?.label === data.attributeId) {
                    const linkedLibraries = await _getLinkedLibraries(data.libraryId, ctx);

                    for (const ll of linkedLibraries) {
                        let attrs = await libraryDomain.getLibraryFullTextAttributes(ll, ctx);
                        attrs = attrs.filter(a => a.linked_library === data.libraryId);

                        const filters = attrs.map(attr => ({
                            field: attr.id,
                            value: data.recordId
                        }));

                        await _indexRecords({library: ll, filters}, ctx);
                    }
                }

                break;
            }
            case EventType.VALUE_DELETE: {
                data = (event.payload as IValuePayload).data;

                const attrProps = await attributeDomain.getAttributeProperties({id: data.attributeId, ctx});

                if (attrProps.multiple_values) {
                    const values = await valueDomain.getValues({
                        library: data.libraryId,
                        recordId: data.recordId,
                        attribute: data.attributeId,
                        options: {forceGetAllValues: true},
                        ctx
                    });

                    await elasticsearchService.update(data.libraryId, data.recordId, {
                        [data.attributeId]: values.map(v => String(v.value))
                    });
                } else {
                    await elasticsearchService.delete(data.libraryId, data.recordId, data.attributeId);
                }

                break;
            }
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
