import {type IValidateHelper} from '../../helpers/validate';
import {type IValueDomain} from '../valueDomain';
import {type i18n} from 'i18next';
import type * as Config from '../../../_types/config';
import {type ITreeValue, type IValue} from '../../../_types/value';
import ValidationError from '../../../errors/ValidationError';
import {AttributeTypes} from '../../../_types/attribute';
import {Errors} from '../../../_types/errors';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IRecordFilterLight, Operator} from '../../../_types/record';
import {type ITreeNode} from '../../../_types/tree';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type FindRecordsHelper} from '../../record/helpers/findRecords';
import {type ITaskFuncParams, TaskPriority, TaskType} from '../../../_types/tasksManager';
import crypto from 'node:crypto';
import PermissionError from '../../../errors/PermissionError';
import {type ITasksManagerDomain} from '../../tasksManager/tasksManagerDomain';
import {NotificationChannels} from '../../../_types/notification';
import {type INotificationDomain} from '../../notification/notificationDomain';
import {logger} from '@leav/logger';

export interface ISaveValueBulkParams {
    libraryId: string;
    recordsFilters?: IRecordFilterLight[];
    fulltextSearch?: string;
    attributeId: string;
    mapping: Array<{
        dependenciesFilters?: IRecordFilterLight[];
        values: Array<{
            before: ITreeNode['id'] | null;
            after: ITreeNode['id'] | null;
        }>;
    }>;
    ctx: IQueryInfos;
}

export interface ISaveValueBulkTask {
    saveValueBulk: (params: ISaveValueBulkParams, task?: ITaskFuncParams) => Promise<string>;
}

export interface ISaveValueBulkTaskDeps {
    config: Config.IConfig;
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.tasksManager': ITasksManagerDomain;
    'core.domain.record.helpers.findRecords': FindRecordsHelper;
    'core.domain.notification': INotificationDomain;
    translator: i18n;
    'core.domain.value': IValueDomain;
}

export default function ({
    config,
    'core.domain.helpers.validate': validate,
    'core.domain.attribute': attributeDomain,
    'core.domain.tasksManager': tasksManagerDomain,
    'core.domain.notification': notificationDomain,
    'core.domain.record.helpers.findRecords': findRecordsHelper,
    'core.domain.value': valueDomain,
    translator,
}: ISaveValueBulkTaskDeps): ISaveValueBulkTask {
    const saveValueBulk = async (params: ISaveValueBulkParams, task?: ITaskFuncParams): Promise<string> => {
        const {libraryId, recordsFilters = [], fulltextSearch, attributeId, mapping, ctx} = params;

        await validate.validateLibrary(libraryId, ctx);
        await validate.validateLibraryAttribute(libraryId, attributeId, ctx);

        const attributeProperties = await attributeDomain.getAttributeProperties({id: attributeId, ctx});

        if (attributeProperties.type !== AttributeTypes.TREE) {
            throw new ValidationError({
                [attributeId]: {
                    msg: Errors.UNSUPPORTED_ATTRIBUTE_TYPE,
                    vars: {attributeType: attributeProperties.type},
                },
            });
        } else if (attributeProperties.multiple_values) {
            throw new ValidationError({
                [attributeId]: {
                    msg: Errors.UNSUPPORTED_ATTRIBUTE_MULTI_VALUE,
                    vars: {},
                },
            });
        }

        if (task?.id === undefined) {
            const newTaskId = crypto.randomUUID();

            await tasksManagerDomain.createTask(
                {
                    id: newTaskId,
                    label: config.lang.available.reduce((labels, lang) => {
                        labels[lang] =
                            `${translator.t('tasks.save_value_bulk.label', {lng: lang, attributeId, libraryId})}`;
                        return labels;
                    }, {}),
                    func: {
                        path: 'core.domain.value.tasks.saveValueBulk',
                        name: 'saveValueBulk',
                        args: params,
                    },
                    role: {
                        type: TaskType.SAVE_VALUE_BULK,
                    },
                    priority: TaskPriority.MEDIUM,
                    startAt: Math.floor(Date.now() / 1000),
                    ...(!!task?.callbacks && {callbacks: task.callbacks}),
                },
                ctx,
            );

            return newTaskId;
        }

        logger.debug(`Starting save value bulk on "${libraryId}" with task id "${task.id}"`);

        try {
            let treatedNumber = 0;
            let recordsNumber = 0;

            await Promise.all(
                mapping.map(async ({dependenciesFilters = [], values}) => {
                    const operations: Array<() => Promise<IValue[]>> = [];
                    const records = await findRecordsHelper({
                        params: {
                            library: libraryId,
                            fulltextSearch,
                            filters: [
                                ...(recordsFilters.length > 0
                                    ? [
                                          {operator: Operator.OPEN_BRACKET},
                                          ...recordsFilters,
                                          {operator: Operator.CLOSE_BRACKET},
                                          ...(dependenciesFilters.length > 0
                                              ? [{operator: Operator.AND}, ...dependenciesFilters]
                                              : []),
                                          // TODO: add values before filters
                                      ]
                                    : dependenciesFilters),
                            ],
                        },
                        ctx,
                    });

                    const valuesMap = new Map(values.map(({before, after}) => [before, after]));

                    await Promise.all(
                        records.list.map(async record => {
                            try {
                                const value = (
                                    await valueDomain.getRecordFieldValue({
                                        library: libraryId,
                                        record,
                                        attributePath: attributeId,
                                        ctx,
                                    })
                                )[0] as ITreeValue;

                                if (!valuesMap.has(value?.payload?.id ?? null)) {
                                    return;
                                }

                                // If we have a value to save, we increment the records number
                                recordsNumber++;

                                const newValue = valuesMap.get(value?.payload?.id ?? null) as ITreeNode['id'];

                                if (newValue !== null && newValue !== undefined) {
                                    operations.push(() =>
                                        valueDomain.saveValue({
                                            library: libraryId,
                                            recordId: record.id,
                                            attribute: attributeId,
                                            value: {
                                                payload: newValue,
                                                ...(value && {id_value: value.id_value}),
                                            },
                                            ctx,
                                        }),
                                    );
                                } else {
                                    operations.push(() =>
                                        valueDomain.deleteValue({
                                            library: libraryId,
                                            recordId: record.id,
                                            attribute: attributeId,
                                            value: {id_value: value.id_value},
                                            ctx,
                                        }),
                                    );
                                }
                            } catch (error) {
                                if (!(error instanceof PermissionError)) {
                                    throw error;
                                }
                            }
                        }),
                    );

                    await Promise.all(
                        operations.map(async operation => {
                            try {
                                await operation();

                                // If the operation is successful, we increment the treated number
                                treatedNumber++;
                            } catch (error) {
                                if (!(error instanceof PermissionError)) {
                                    throw error;
                                }
                            }
                        }),
                    );
                }),
            );

            await notificationDomain.createNotification(
                {
                    content: {
                        level: 'success',
                        title: translator.t('notifications.save_value_bulk_complete_title', {
                            lng: ctx.lang,
                        }),
                        message: translator.t('notifications.save_value_bulk_complete_message', {
                            lng: ctx.lang,
                            interpolation: {escapeValue: false},
                            number: treatedNumber,
                            date: new Date().toLocaleString(ctx.lang),
                            total: recordsNumber,
                        }),
                    },
                    metadata: {
                        priority: 'normal',
                        taskId: task.id,
                    },
                    recipients: {
                        userIds: [ctx.userId],
                        groupIds: [],
                    },
                    emitterUserId: ctx.userId,
                    channels: [NotificationChannels.WEB_SOCKET],
                },
                ctx,
            );

            return task.id;
        } catch (error) {
            logger.error(`Save value bulk task "${task.id}" failed: ${error.message}`, {error});

            await notificationDomain.createNotification(
                {
                    content: {
                        level: 'error',
                        title: translator.t('notifications.save_value_bulk_error_title', {
                            lng: ctx.lang,
                        }),
                        message: translator.t('notifications.save_value_bulk_error_message', {
                            lng: ctx.lang,
                            interpolation: {escapeValue: false},
                            date: new Date().toLocaleString(ctx.lang),
                        }),
                    },
                    metadata: {
                        priority: 'normal',
                        taskId: task.id,
                    },
                    recipients: {
                        userIds: [ctx.userId],
                        groupIds: [],
                    },
                    emitterUserId: ctx.userId,
                    channels: [NotificationChannels.WEB_SOCKET],
                },
                ctx,
            );

            throw error;
        }
    };

    return {saveValueBulk};
}
