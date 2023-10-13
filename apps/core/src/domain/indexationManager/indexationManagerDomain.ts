// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import {EventAction, IDbEvent} from '@leav/utils';
import * as amqp from 'amqplib';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IFindRecordParams} from 'domain/record/_types';
import {ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import {i18n} from 'i18next';
import Joi from 'joi';
import {difference, intersectionBy, isEqual} from 'lodash';
import {v4 as uuidv4} from 'uuid';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IValue} from '_types/value';
import {IIndexationService} from '../../infra/indexation/indexationService';
import {AttributeTypes, IAttribute} from '../../_types/attribute';
import {TriggerNames} from '../../_types/eventsManager';
import {AttributeCondition, IRecord} from '../../_types/record';
import {ITaskFuncParams, TaskPriority, TaskType} from '../../_types/tasksManager';

interface IIndexDatabaseParams {
    findRecordParams: IFindRecordParams | IFindRecordParams[];
    attributes?: {up?: string[]; del?: string[]};
    ctx: IQueryInfos;
    forceNoTask?: boolean;
}

export interface IIndexationManagerDomain {
    init(): Promise<void>;
    indexDatabase(params: IIndexDatabaseParams, task?: ITaskFuncParams): Promise<string>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
    'core.domain.record'?: IRecordDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.indexation.indexationService'?: IIndexationService;
    'core.domain.tasksManager'?: ITasksManagerDomain;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    translator?: i18n;
}

export default function({
    config = null,
    'core.infra.amqpService': amqpService = null,
    'core.domain.record': recordDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.tasksManager': tasksManagerDomain = null,
    'core.infra.indexation.indexationService': indexationService = null,
    'core.domain.eventsManager': eventsManager = null,
    translator = null
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

        // We retrieve the properties of the indexed attributes to be updated
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
            // We iterate on the attributes to be edited and define new values for these attributes.
            // The _toUp function returns the updated value of an attribute. Attributes to be deleted are set to null.
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

        // We cross-reference the attributes that point to the library that has been previously updated and
        // the indexed attributes of each library. If these libraries use them, we need to update the indexes.
        for (const l of libs) {
            const intersections = intersectionBy(l.fullTextAttributes, attributesToUpdate, 'id');

            if (intersections.length) {
                let filters;

                if (typeof toRecordId !== 'undefined') {
                    filters = intersections.map(a => ({
                        field: `${a.id}.${a.linked_tree ? `${libraryId}.` : ''}id`, // if field is a tree attribute, we must specify the library
                        condition: AttributeCondition.EQUAL,
                        value: toRecordId
                    }));
                }

                await _indexDatabase({
                    findRecordParams: {library: l.id, filters},
                    ctx,
                    attributes: {up: intersections.map(a => a.id)},
                    forceNoTask: true
                });
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

        const payload = event.payload;
        switch (event.payload.action) {
            case EventAction.RECORD_SAVE: {
                await _indexDatabase({
                    findRecordParams: {
                        library: payload.topic.library,
                        filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: payload.topic.record.id}]
                    },
                    ctx,
                    forceNoTask: true
                });

                break;
            }
            case EventAction.LIBRARY_SAVE: {
                const oldSettings = payload.before;
                const newSettings = payload.after;
                const attrsToDel = difference(
                    oldSettings?.fullTextAttributes,
                    newSettings?.fullTextAttributes
                ) as string[];
                const attrsToAdd = difference(
                    newSettings?.fullTextAttributes,
                    oldSettings?.fullTextAttributes
                ) as string[];

                if (!isEqual(oldSettings?.fullTextAttributes?.sort(), newSettings?.fullTextAttributes?.sort())) {
                    await _indexDatabase({
                        findRecordParams: {library: payload.topic.library},
                        ctx,
                        attributes: {up: attrsToAdd, del: attrsToDel}
                    });
                }

                // if label change we re-index all linked libraries
                if (newSettings.recordIdentityConf?.label !== newSettings?.recordIdentityConf?.label) {
                    await _indexLinkedLibraries(newSettings.id, ctx);
                }

                break;
            }
            case EventAction.VALUE_SAVE: {
                const fullTextAttributes = await attributeDomain.getLibraryFullTextAttributes(
                    payload.topic.library,
                    ctx
                );

                const isActivated = payload.topic.attribute === 'active' && payload.after.value === true;
                const isAttrToIndex = fullTextAttributes.map(a => a.id).includes(payload.topic.attribute);

                if (isActivated || isAttrToIndex) {
                    await _indexDatabase({
                        findRecordParams: {
                            library: payload.topic.library,
                            filters: [
                                {field: 'id', condition: AttributeCondition.EQUAL, value: payload.topic.record.id}
                            ]
                        },
                        ctx,
                        attributes: isActivated || !isAttrToIndex ? null : {up: [payload.topic.attribute]},
                        forceNoTask: true
                    });
                }

                // if the new attribute's value is the label of the library
                // we have to re-index all linked libraries
                const library = await libraryDomain.getLibraryProperties(payload.topic.library, ctx);
                if (library.recordIdentityConf?.label === payload.topic.attribute) {
                    await _indexLinkedLibraries(payload.topic.library, ctx, payload.topic.record.id);
                }

                break;
            }
            case EventAction.VALUE_DELETE: {
                const attrProps = await attributeDomain.getAttributeProperties({id: payload.topic.attribute, ctx});

                await _indexDatabase({
                    findRecordParams: {
                        library: payload.topic.library,
                        filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: payload.topic.record.id}]
                    },
                    ctx,
                    attributes: attrProps.multiple_values
                        ? {up: [payload.topic.attribute]}
                        : {del: [payload.topic.attribute]},
                    forceNoTask: true
                });

                // if the updated/deleted attribute is the label of the library
                // we have to re-index all linked libraries
                const library = await libraryDomain.getLibraryProperties(payload.topic.library, ctx);
                if (library.recordIdentityConf?.label === payload.topic.attribute) {
                    await _indexLinkedLibraries(payload.topic.library, ctx, payload.topic.record.id);
                }

                break;
            }
        }
    };

    const _validateMsg = (msg: IDbEvent) => {
        const msgBodySchema = Joi.object()
            .keys({
                time: Joi.number().required(),
                userId: Joi.string().required(),
                emitter: Joi.string().required(),
                payload: Joi.object()
                    .keys({
                        trigger: Joi.string(),
                        action: Joi.string()
                            .valid(...Object.values(EventAction))
                            .required(),
                        topic: Joi.object()
                            .keys({
                                record: Joi.object().keys({
                                    id: Joi.string().required(),
                                    libraryId: Joi.string().required()
                                }),
                                library: Joi.string(),
                                attribute: Joi.string(),
                                tree: Joi.string()
                            })
                            .unknown(true)
                            .allow(null),
                        before: Joi.any(),
                        after: Joi.any(),
                        metadata: Joi.any()
                    })
                    .required()
            })
            .unknown(true);

        const isValid = msgBodySchema.validate(msg);

        if (!!isValid.error) {
            const errorMsg = isValid.error.details.map(e => e.message).join(', ');
            throw new Error(errorMsg);
        }
    };

    const _indexDatabase = async (params: IIndexDatabaseParams, task?: ITaskFuncParams): Promise<string> => {
        const findRecordParams = [].concat(params.findRecordParams || []);

        if (!params.forceNoTask && typeof task?.id === 'undefined') {
            const newTaskId = uuidv4();

            await tasksManagerDomain.createTask(
                {
                    id: newTaskId,
                    label: config.lang.available.reduce((labels, lang) => {
                        labels[lang] = `${translator.t('indexation.index_database', {
                            lng: lang,
                            library: findRecordParams.map(e => e.library).join(', ')
                        })}`;
                        return labels;
                    }, {}),
                    func: {
                        moduleName: 'domain',
                        subModuleName: 'indexationManager',
                        name: 'indexDatabase',
                        args: params
                    },
                    role: {
                        type: TaskType.INDEXATION,
                        detail: findRecordParams.map(e => e.library).join(',')
                    },
                    priority: TaskPriority.MEDIUM,
                    startAt: !!task?.startAt ? task.startAt : Math.floor(Date.now() / 1000),
                    ...(!!task?.callbacks && {callbacks: task.callbacks})
                },
                params.ctx
            );

            return newTaskId;
        }

        const _updateLibraryIndexationStatus = async (inProgress: boolean) => {
            for (const libraryId of findRecordParams.map(e => e.library)) {
                await eventsManager.sendPubSubEvent(
                    {
                        triggerName: TriggerNames.INDEXATION,
                        data: {indexation: {userId: params.ctx.userId, libraryId, inProgress}}
                    },
                    params.ctx
                );
            }
        };

        await _updateLibraryIndexationStatus(true);

        for (const frp of findRecordParams) {
            await _indexRecords(frp, params.ctx);
        }

        await _updateLibraryIndexationStatus(false);

        return task.id;
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
        indexDatabase: _indexDatabase
    };
}
