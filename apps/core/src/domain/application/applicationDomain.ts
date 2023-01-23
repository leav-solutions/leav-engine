// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CONSULTED_APPS_KEY} from '@leav/utils';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import {IUserDomain} from 'domain/user/userDomain';
import {i18n} from 'i18next';
import {IApplicationRepo} from 'infra/application/applicationRepo';
import {IApplicationService} from 'infra/application/applicationService';
import {IUtils} from 'utils/utils';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {
    ApplicationEventTypes,
    ApplicationInstallStatuses,
    ApplicationTypes,
    IApplication,
    IApplicationModule,
    IGetCoreApplicationsParams
} from '../../_types/application';
import {ErrorFieldDetail, Errors} from '../../_types/errors';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {ITaskFuncParams, TaskPriority} from '../../_types/tasksManager';

export const MAX_CONSULTATION_HISTORY_SIZE = 10;
export const TRIGGER_NAME_APPLICATION_EVENT = 'applicationEvent';

export interface IApplicationDomain {
    getApplicationProperties(params: {id: string; ctx: IQueryInfos}): Promise<IApplication>;

    /**
     * Get applications list, filtered or not
     */
    getApplications(params: {params?: IGetCoreApplicationsParams; ctx: IQueryInfos}): Promise<IList<IApplication>>;

    /**
     * Save application.
     * If application doesn't exist => create a new one, otherwise update existing
     */
    saveApplication(params: {applicationData: IApplication; ctx: IQueryInfos}): Promise<IApplication>;
    deleteApplication(params: {id: string; ctx: IQueryInfos}): Promise<IApplication>;
    updateConsultationHistory(params: {applicationId: string; ctx: IQueryInfos}): Promise<void>;
    getAvailableModules(params: {ctx: IQueryInfos}): Promise<IApplicationModule[]>;
    runInstall(params: {applicationId: string; ctx: IQueryInfos}, task?: ITaskFuncParams): Promise<string>;
    getApplicationUrl(params: {application: IApplication; ctx: IQueryInfos}): string;
}

interface IDeps {
    'core.domain.permission.admin'?: IAdminPermissionDomain;
    'core.domain.user'?: IUserDomain;
    'core.domain.tasksManager'?: ITasksManagerDomain;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.infra.application'?: IApplicationRepo;
    'core.infra.application.service'?: IApplicationService;
    'core.utils'?: IUtils;
    translator?: i18n;
    config?: IConfig;
}

export default function({
    'core.domain.permission.admin': adminPermissionDomain = null,
    'core.domain.user': userDomain = null,
    'core.domain.tasksManager': tasksManagerDomain = null,
    'core.domain.eventsManager': eventsManagerDomain = null,
    'core.infra.application': applicationRepo = null,
    'core.infra.application.service': applicationService = null,
    'core.utils': utils = null,
    translator = null,
    config = null
}: IDeps = {}): IApplicationDomain {
    const _getApplicationProperties = async ({id, ctx}) => {
        const apps = await applicationRepo.getApplications({
            params: {filters: {id}, strictFilters: true},
            ctx
        });

        if (!apps.list.length) {
            throw new ValidationError<IApplication>({
                id: {msg: Errors.UNKNOWN_APPLICATION, vars: {application: id}}
            });
        }
        const props = apps.list.pop();

        return props;
    };

    const _sendAppEvent = async (
        params: {
            application: IApplication;
            type: ApplicationEventTypes;
        },
        ctx: IQueryInfos
    ): Promise<void> => {
        const {application, type} = params;

        return eventsManagerDomain.sendPubSubEvent(
            {
                data: {
                    applicationEvent: {
                        type,
                        application
                    }
                },
                triggerName: TRIGGER_NAME_APPLICATION_EVENT
            },
            ctx
        );
    };

    return {
        async getApplicationProperties(params) {
            return _getApplicationProperties(params);
        },
        async getApplications({params, ctx}) {
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return applicationRepo.getApplications({params: initializedParams, ctx});
        },
        async saveApplication({applicationData, ctx}) {
            // Check if application exists
            const apps = await applicationRepo.getApplications({
                params: {filters: {id: applicationData.id}, strictFilters: true},
                ctx
            });

            const isExistingApp = apps.list.length;

            const defaultParams: Partial<IApplication> = {
                id: '',
                system: false,
                type: ApplicationTypes.INTERNAL,
                install: {
                    status: ApplicationInstallStatuses.NONE,
                    lastCallResult: null
                }
            };

            const appProps: IApplication = apps.list[0] ?? null;
            const appToSave: IApplication = isExistingApp
                ? {
                      ...defaultParams,
                      ...appProps,
                      ...applicationData
                  }
                : {...defaultParams, ...applicationData};

            const isExternalApp = appToSave.type === ApplicationTypes.EXTERNAL;

            const errors: ErrorFieldDetail<IApplication> = {};

            const permissionToCheck = isExistingApp
                ? AdminPermissionsActions.EDIT_APPLICATION
                : AdminPermissionsActions.CREATE_APPLICATION;

            const canSave = await adminPermissionDomain.getAdminPermission({
                action: permissionToCheck,
                userId: ctx.userId,
                ctx
            });

            if (!canSave) {
                throw new PermissionError(permissionToCheck);
            }

            if (!isExistingApp && !utils.isIdValid(appToSave.id)) {
                errors.id = Errors.INVALID_ID_FORMAT;
            }

            if (!utils.isEndpointValid(appToSave.endpoint, isExternalApp)) {
                errors.endpoint = Errors.INVALID_ENDPOINT_FORMAT;
            }

            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            // If doesn't exist, we create it. Otherwise, update it
            const savedApp = await (isExistingApp
                ? applicationRepo.updateApplication({applicationData: appToSave, ctx})
                : applicationRepo.createApplication({applicationData: appToSave, ctx}));

            await _sendAppEvent(
                {
                    application: savedApp,
                    type: ApplicationEventTypes.SAVE
                },
                ctx
            );

            if (!isExistingApp && savedApp.type === ApplicationTypes.INTERNAL) {
                await this.runInstall({applicationId: savedApp.id, ctx});
            }

            return savedApp;
        },
        async deleteApplication({id, ctx}) {
            const apps = await applicationRepo.getApplications({
                params: {filters: {id}, strictFilters: true},
                ctx
            });

            const canDelete = await adminPermissionDomain.getAdminPermission({
                action: AdminPermissionsActions.DELETE_APPLICATION,
                userId: ctx.userId,
                ctx
            });

            if (!canDelete) {
                throw new PermissionError(AdminPermissionsActions.DELETE_APPLICATION);
            }

            if (!apps.list.length) {
                throw new ValidationError({id: {msg: Errors.UNKNOWN_APPLICATION, vars: {application: id}}});
            }

            const appProps = apps.list[0];
            if (appProps.type === ApplicationTypes.INTERNAL) {
                await applicationService.runUninstall({application: appProps, ctx});
            }

            const deletedApp = await applicationRepo.deleteApplication({id, ctx});

            await _sendAppEvent(
                {
                    application: deletedApp,
                    type: ApplicationEventTypes.DELETE
                },
                ctx
            );

            return deletedApp;
        },
        async updateConsultationHistory({applicationId, ctx}): Promise<void> {
            // Retrieve user data
            const consultedApps = await userDomain.getUserData([CONSULTED_APPS_KEY], false, ctx);

            // Compute new history:
            // - Add last consulted app to the beginning of the list
            // - Use a Set to deduplicate array
            // - Limit size to MAX_CONSULTATION_HISTORY_SIZE
            const newHistory = [...new Set([applicationId, ...(consultedApps.data[CONSULTED_APPS_KEY] ?? [])])].slice(
                0,
                MAX_CONSULTATION_HISTORY_SIZE
            );

            // Save new history
            await userDomain.saveUserData({
                key: CONSULTED_APPS_KEY,
                value: newHistory,
                global: false,
                isCoreData: true,
                ctx
            });
        },
        async getAvailableModules({ctx}): Promise<IApplicationModule[]> {
            return applicationRepo.getAvailableModules({ctx});
        },
        async runInstall({applicationId, ctx}, task) {
            if (typeof task?.id === 'undefined') {
                const newTaskId = await tasksManagerDomain.createTask(
                    {
                        label: config.lang.available.reduce((labels, lang) => {
                            labels[lang] = `${translator.t('tasks.app_install', {appId: applicationId, lang})}`;
                            return labels;
                        }, {}),
                        func: {
                            moduleName: 'domain',
                            subModuleName: 'application',
                            name: 'runInstall',
                            args: {applicationId, ctx}
                        },
                        priority: TaskPriority.HIGH
                    },
                    ctx
                );

                return newTaskId;
            }

            const appProps = await _getApplicationProperties({id: applicationId, ctx});

            const appPropsBeforeInstall = {
                ...appProps,
                install: {status: ApplicationInstallStatuses.RUNNING, lastCallResult: ''}
            };

            await applicationRepo.updateApplication({
                applicationData: appPropsBeforeInstall,
                ctx
            });

            await _sendAppEvent(
                {
                    application: appPropsBeforeInstall,
                    type: ApplicationEventTypes.SAVE
                },
                ctx
            );

            const installResult = await applicationService.runInstall({application: appProps, ctx});

            const appPropsAfterInstall = {...appProps, install: installResult};

            await applicationRepo.updateApplication({
                applicationData: appPropsAfterInstall,
                ctx
            });
            await _sendAppEvent(
                {
                    application: appPropsAfterInstall,
                    type: ApplicationEventTypes.SAVE
                },
                ctx
            );

            return task.id;
        },
        getApplicationUrl({application}) {
            if (application.type === ApplicationTypes.INTERNAL) {
                return `${config.server.publicUrl}/${utils.getFullApplicationEndpoint(application.endpoint)}/`;
            }

            // External application: make sure URL starts with http or https
            const url = application.endpoint.match(/^http(s)?:\/\//i)
                ? application.endpoint
                : `http://${application.endpoint}`;

            return url;
        }
    };
}
