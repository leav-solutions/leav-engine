import {type IAmqpService} from '@leav/message-broker';
import {EventAction, type IDbEvent} from '@leav/utils';
import type * as amqp from 'amqplib';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {type ILibraryDomain} from '../library/libraryDomain';
import {type IRecordDomain} from '../record/recordDomain';
import {type IFindRecordParams} from '../record/_types';
import {type ITasksManagerDomain} from '../tasksManager/tasksManagerDomain';
import {type i18n} from 'i18next';
import Joi from 'joi';
import {difference, intersectionBy, isEqual} from 'lodash';
import * as crypto from 'node:crypto';
import {type ILogger} from '@leav/logger';
import type * as Config from '../../_types/config';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IValue} from '../../_types/value';
import {type IIndexationService} from '../../infra/indexation/indexationService';
import {AttributeTypes, type IAttribute} from '../../_types/attribute';
import {TriggerNames} from '../../_types/eventsManager';
import {AttributeCondition, type IRecord} from '../../_types/record';
import {type ITaskFuncParams, TaskPriority, TaskType} from '../../_types/tasksManager';
import {type GetSystemQueryContext} from '../../utils/helpers/getSystemQueryContext';
import {type IAdminPermissionDomain} from '../permission/adminPermissionDomain';
import {AdminPermissionsActions} from '../../_types/permissions';
import PermissionError from '../../errors/PermissionError';
import {CommonAttributes} from '../../_constants/systemAttributes';

interface IIndexDatabaseParams {
    findRecordParams: IFindRecordParams | IFindRecordParams[];
    attributes?: {up?: string[]; del?: string[]};
    ctx: IQueryInfos;
    forceNoTask?: boolean;
}

export interface IIndexationManagerDomain {
    init(): Promise<void>;
    indexDatabase(params: IIndexDatabaseParams, task?: ITaskFuncParams): Promise<void>;
}

export interface IIndexationManagerDomainDeps {
    config: Config.IConfig;
    'core.infra.amqpService': IAmqpService;
    'core.domain.record': IRecordDomain;
    'core.domain.library': ILibraryDomain;
    'core.domain.attribute': IAttributeDomain;
    'core.infra.indexation.indexationService': IIndexationService;
    'core.domain.permission.admin': IAdminPermissionDomain;
    'core.domain.tasksManager': ITasksManagerDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.utils.logger': ILogger;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
    translator: i18n;
}

export default function ({
    config,
    'core.infra.amqpService': amqpService,
    'core.domain.record': recordDomain,
    'core.domain.library': libraryDomain,
    'core.domain.attribute': attributeDomain,
    'core.domain.permission.admin': adminPermissionDomain,
    'core.domain.tasksManager': tasksManagerDomain,
    'core.infra.indexation.indexationService': indexationService,
    'core.domain.eventsManager': eventsManager,
    'core.utils.logger': logger,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
    translator,
}: IIndexationManagerDomainDeps): IIndexationManagerDomain {
    const _indexRecords = async (
        findRecordParams: IFindRecordParams,
        ctx: IQueryInfos,
        attributes?: {up?: string[]; del?: string[]},
    ): Promise<void> => {
        if (!(await indexationService.isLibraryListed(findRecordParams.library))) {
            await indexationService.listLibrary(findRecordParams.library);
        }

        const fullTextLibraryAttributes = await attributeDomain.getLibraryFullTextAttributes(
            findRecordParams.library,
            ctx,
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
                attributePath: attribute.id,
                options: {
                    forceGetAllValues: true,
                },
                ctx,
            });

            // FIXME: is this statement necessary?
            if (typeof val === 'undefined') {
                return {};
            }

            val = await _getFormattedValuesAndLabels(attribute, val, ctx);

            const value = val.map(v => v?.payload).filter(e => e);

            if (value.length === 0) {
                return {[attribute.id]: null};
            }

            return {
                [attribute.id]: typeof value === 'object' ? JSON.stringify(value) : String(value),
            };
        };

        const records = await recordDomain.find({
            params: findRecordParams,
            ctx,
        });

        for (const record of records.list) {
            // We iterate on the attributes to be edited and define new values for these attributes.
            // The _toUp function returns the updated value of an attribute. Attributes to be deleted are set to null.
            const data = (await Promise.all([...attributesToEdit.up.map(async a => _toUp(record, a))]))
                .concat(attributesToEdit.del.map(a => ({[a.id]: null})))
                .reduce((acc, e) => ({...acc, ...e}), {});

            await indexationService.indexRecord(findRecordParams.library, record.id, data, ctx);
        }
    };

    const _getFormattedValuesAndLabels = async (
        attribute: IAttribute,
        values: IValue[],
        ctx: IQueryInfos,
    ): Promise<IValue[]> => {
        if (attribute.type === AttributeTypes.TREE) {
            values = values.map(v => ({
                ...v,
                payload: v.payload?.record,
            }));
        }

        if (
            attribute.type === AttributeTypes.SIMPLE_LINK ||
            attribute.type === AttributeTypes.ADVANCED_LINK ||
            attribute.type === AttributeTypes.TREE
        ) {
            const promises = values.map(async v => {
                const recordIdentity = await recordDomain.getRecordIdentity(
                    {id: v.payload.id, library: attribute.linked_library || v.payload.library},
                    ctx,
                );

                return {
                    ...v,
                    payload: (await recordIdentity.getLabel?.()) || v.payload.id,
                };
            });

            values = await Promise.all(promises);
        }

        return values;
    };

    const _indexLinkedLibraries = async (libraryId: string, ctx: IQueryInfos, toRecordId?: string): Promise<void> => {
        // get all attributes with the new library as linked library / linked_tree
        const attributesToUpdate = (
            await attributeDomain.getAttributes({
                params: {
                    filters: {linked_library: libraryId},
                },
                ctx,
            })
        ).list.concat(
            (
                await attributeDomain.getAttributes({
                    params: {
                        filters: {linked_tree: libraryId},
                    },
                    ctx,
                })
            ).list,
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
                        value: toRecordId,
                    }));
                }

                await _indexDatabase({
                    findRecordParams: {library: l.id, filters},
                    ctx,
                    attributes: {up: intersections.map(a => a.id)},
                    forceNoTask: true,
                });
            }
        }
    };

    const _onMessage = async (msg: amqp.ConsumeMessage): Promise<void> => {
        try {
            const event: IDbEvent = JSON.parse(msg.content.toString());
            const ctx = getSystemQueryContext('indexationManager:onMessage');

            _validateMsg(event);

            const payload = event.payload;
            switch (event.payload.action) {
                case EventAction.RECORD_SAVE:
                case EventAction.RECORD_INIT: {
                    await _indexDatabase({
                        findRecordParams: {
                            library: payload.topic.record.libraryId,
                            filters: [
                                {
                                    field: CommonAttributes.ID,
                                    condition: AttributeCondition.EQUAL,
                                    value: payload.topic.record.id,
                                },
                            ],
                            retrieveInactive: true,
                        },
                        ctx,
                        forceNoTask: true,
                    });

                    break;
                }
                case EventAction.LIBRARY_SAVE: {
                    const oldSettings = payload.before;
                    const newSettings = payload.after;
                    const attrsToDel = difference(
                        oldSettings?.fullTextAttributes,
                        newSettings?.fullTextAttributes,
                    ) as string[];
                    const attrsToAdd = difference(
                        newSettings?.fullTextAttributes,
                        oldSettings?.fullTextAttributes,
                    ) as string[];

                    if (!isEqual(oldSettings?.fullTextAttributes?.sort(), newSettings?.fullTextAttributes?.sort())) {
                        await _indexDatabase({
                            findRecordParams: {library: payload.topic.library, retrieveInactive: true},
                            ctx,
                            attributes: {up: attrsToAdd, del: attrsToDel},
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
                        ctx,
                    );

                    const isActivated = payload.topic.attribute === 'active' && payload.after.value === true;
                    const isAttrToIndex = fullTextAttributes.map(a => a.id).includes(payload.topic.attribute);

                    if (isActivated || isAttrToIndex) {
                        await _indexDatabase({
                            findRecordParams: {
                                library: payload.topic.library,
                                filters: [
                                    {
                                        field: CommonAttributes.ID,
                                        condition: AttributeCondition.EQUAL,
                                        value: payload.topic.record.id,
                                    },
                                ],
                                retrieveInactive: true,
                            },
                            ctx,
                            attributes: isActivated || !isAttrToIndex ? null : {up: [payload.topic.attribute]},
                            forceNoTask: true,
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
                            filters: [
                                {
                                    field: CommonAttributes.ID,
                                    condition: AttributeCondition.EQUAL,
                                    value: payload.topic.record.id,
                                },
                            ],
                            retrieveInactive: true,
                        },
                        ctx,
                        attributes: attrProps.multiple_values
                            ? {up: [payload.topic.attribute]}
                            : {del: [payload.topic.attribute]},
                        forceNoTask: true,
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
        } catch (e) {
            logger.error(`Indexation Manager - Error while processing message: ${e.stack}`, {
                msg: {
                    ...msg,
                    content: msg.content.toString(),
                },
            });
        } finally {
            amqpService.consumer.channel.ack(msg);
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
                        action: Joi.string().required(),
                        topic: Joi.object()
                            .keys({
                                record: Joi.object().keys({
                                    id: Joi.string().required(),
                                    libraryId: Joi.string().required(),
                                }),
                                library: Joi.string(),
                                attribute: Joi.string(),
                                tree: Joi.string(),
                            })
                            .unknown(true)
                            .allow(null),
                        before: Joi.any(),
                        after: Joi.any(),
                        metadata: Joi.any(),
                    })
                    .required(),
            })
            .unknown(true);

        const isValid = msgBodySchema.validate(msg);

        if (isValid.error) {
            const errorMsg = isValid.error.details.map(e => e.message).join(', ');
            throw new Error(errorMsg);
        }
    };

    async function _createIndexationTask(
        findRecordParams: IFindRecordParams[],
        params: IIndexDatabaseParams,
        task: ITaskFuncParams,
    ) {
        const newTaskId = crypto.randomUUID();

        await tasksManagerDomain.createTask(
            {
                id: newTaskId,
                label: config.lang.available.reduce((labels, lang) => {
                    labels[lang] = `${translator.t('indexation.index_database', {
                        lng: lang,
                        library: findRecordParams.map(e => e.library).join(', '),
                    })}`;
                    return labels;
                }, {}),
                func: {
                    path: 'core.domain.indexationManager',
                    name: 'indexDatabase',
                    args: params,
                },
                role: {
                    type: TaskType.INDEXATION,
                    detail: findRecordParams.map(e => e.library).join(','),
                },
                priority: TaskPriority.MEDIUM,
                startAt: task?.startAt ? task.startAt : Math.floor(Date.now() / 1000),
                ...(!!task?.callbacks && {callbacks: task.callbacks}),
            },
            params.ctx,
        );

        return newTaskId;
    }

    const _indexDatabase = async (params: IIndexDatabaseParams, task?: ITaskFuncParams): Promise<void> => {
        const findRecordParams = [].concat(params.findRecordParams || []);
        const mustCreateTask = !params.forceNoTask && typeof task?.id === 'undefined';

        if (mustCreateTask) {
            await _createIndexationTask(findRecordParams, params, task);
            return;
        }

        const _updateLibraryIndexationStatus = async (inProgress: boolean) => {
            for (const libraryId of findRecordParams.map(e => e.library)) {
                await eventsManager.sendPubSubEvent(
                    {
                        triggerName: TriggerNames.INDEXATION,
                        data: {indexation: {userId: params.ctx.userId, libraryId, inProgress}},
                    },
                    params.ctx,
                );
            }
        };

        await _updateLibraryIndexationStatus(true);

        for (const frp of findRecordParams) {
            await _indexRecords(frp, params.ctx);
        }

        await _updateLibraryIndexationStatus(false);
    };

    return {
        async init(): Promise<void> {
            // Init rabbitmq
            await amqpService.consumer.channel.assertQueue(config.indexationManager.queues.events);
            await amqpService.consumer.channel.bindQueue(
                config.indexationManager.queues.events,
                config.amqp.exchange,
                config.eventsManager.routingKeys.data_events,
            );

            await amqpService.consume(
                config.indexationManager.queues.events,
                config.eventsManager.routingKeys.data_events,
                _onMessage,
            );

            await indexationService.init();

            logger.info('Indexation Manager is ready. Waiting for events... 👀');
        },
        indexDatabase: async (params: IIndexDatabaseParams, task?: ITaskFuncParams) => {
            const canEditLibrary = await adminPermissionDomain.getAdminPermission({
                action: AdminPermissionsActions.EDIT_LIBRARY,
                ctx: params.ctx,
            });

            if (!canEditLibrary) {
                throw new PermissionError(AdminPermissionsActions.EDIT_LIBRARY);
            }

            return _indexDatabase(params, task);
        },
    };
}
