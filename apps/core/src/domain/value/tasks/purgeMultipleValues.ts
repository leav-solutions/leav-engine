// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IValueRepo} from '../../../infra/value/valueRepo';
import PermissionError from '../../../errors/PermissionError';
import ValidationError from '../../../errors/ValidationError';
import {AttributeTypes} from '../../../_types/attribute';
import {Errors} from '../../../_types/errors';
import {AdminPermissionsActions} from '../../../_types/permissions';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IAdminPermissionDomain} from '../../permission/adminPermissionDomain';
import crypto from 'node:crypto';
import {logger} from '@leav/logger';
import {type ITaskFuncParams, TaskPriority, TaskType} from '../../../_types/tasksManager';
import {type ITasksManagerDomain} from '../../tasksManager/tasksManagerDomain';
import type * as Config from '../../../_types/config';
import {type i18n} from 'i18next';
import {type INotificationDomain} from '../../notification/notificationDomain';
import {NotificationChannels} from '../../../_types/notification';

export interface IPurgeMultipleValuesTask {
    // Purge multiples values of a mono attribute and keep only the more recent one
    purgeMultipleValues(params: {attributeId: string; ctx: IQueryInfos}, task?: ITaskFuncParams): Promise<string>;
}

export interface IPurgeMultipleValuesTaskDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.infra.value': IValueRepo;
    'core.domain.permission.admin': IAdminPermissionDomain;
    'core.domain.tasksManager': ITasksManagerDomain;
    config: Config.IConfig;
    translator: i18n;
    'core.domain.notification': INotificationDomain;
}

export default function ({
    config,
    'core.domain.permission.admin': adminPermissionDomain,
    'core.domain.attribute': attributeDomain,
    'core.infra.value': valueRepo,
    'core.domain.tasksManager': tasksManager,
    translator,
    'core.domain.notification': notificationDomain,
}: IPurgeMultipleValuesTaskDeps): IPurgeMultipleValuesTask {
    return {
        purgeMultipleValues: async (params, task?: ITaskFuncParams): Promise<string> => {
            const {attributeId, ctx} = params;

            const canSavePermission = await adminPermissionDomain.getAdminPermission({
                action: AdminPermissionsActions.EDIT_ATTRIBUTE,
                ctx,
            });
            if (!canSavePermission) {
                throw new PermissionError(AdminPermissionsActions.EDIT_ATTRIBUTE);
            }

            const attribute = await attributeDomain.getAttributeProperties({id: attributeId, ctx});

            if (
                attribute.type !== AttributeTypes.ADVANCED &&
                attribute.type !== AttributeTypes.ADVANCED_LINK &&
                attribute.type !== AttributeTypes.TREE
            ) {
                throw new ValidationError({
                    [attributeId]: {
                        msg: Errors.UNSUPPORTED_ATTRIBUTE_TYPE,
                        vars: {attributeType: attribute.type},
                    },
                });
            }

            if (attribute.multiple_values) {
                throw new ValidationError({
                    [attributeId]: {
                        msg: Errors.UNSUPPORTED_ATTRIBUTE_MULTI_VALUE,
                        vars: {},
                    },
                });
            }

            if (typeof task?.id === 'undefined') {
                const newTaskId = crypto.randomUUID();
                logger.debug(`Creating purgeMultipleValues task "${newTaskId}" for attribute "${attributeId}"`);

                return tasksManager.createTask(
                    {
                        id: newTaskId,
                        label: config.lang.available.reduce((labels, lang) => {
                            labels[lang] =
                                `${translator.t('tasks.purge_multiple_values.label', {lng: lang, attributeId})}`;
                            return labels;
                        }, {}),
                        func: {
                            path: 'core.domain.value.tasks.purgeMultipleValues',
                            name: 'purgeMultipleValues',
                            args: params,
                        },
                        role: {
                            type: TaskType.PURGE_MULTIPLE_VALUES,
                        },
                        startAt: Math.floor(Date.now() / 1000),
                        priority: TaskPriority.MEDIUM,
                        ...(!!task?.callbacks && {callbacks: task.callbacks}),
                    },
                    ctx,
                );
            }

            try {
                const attributeLibraries = await attributeDomain.getAttributeLibraries({attributeId, ctx});

                await Promise.all(
                    attributeLibraries.map(async ({id: libraryId}) =>
                        valueRepo.clearMultipleValues({libraryId, attribute, ctx}),
                    ),
                );

                await notificationDomain.createNotification(
                    {
                        content: {
                            level: 'success',
                            title: translator.t('notifications.purge_multiple_values_complete_title', {
                                lng: ctx.lang,
                            }),
                            message: translator.t('notifications.purge_multiple_values_complete_message', {
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

                return task.id;
            } catch (error) {
                logger.error(`Multiple values purge task "${task.id}" failed: ${error.message}`, {error});

                await notificationDomain.createNotification(
                    {
                        content: {
                            level: 'error',
                            title: translator.t('notifications.purge_multiple_values_error_title', {lng: ctx.lang}),
                            message: translator.t('notifications.purge_multiple_values_error_message', {
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
                    },
                    ctx,
                );

                throw error;
            }

            return task.id;
        },
    };
}
