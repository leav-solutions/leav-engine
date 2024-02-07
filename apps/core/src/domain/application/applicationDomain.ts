// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CONSULTED_APPS_KEY, EventAction} from '@leav/utils';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {IUserDomain} from 'domain/user/userDomain';
import {i18n} from 'i18next';
import {IApplicationRepo} from 'infra/application/applicationRepo';
import {IUtils} from 'utils/utils';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {
    ApplicationEventTypes,
    ApplicationTypes,
    IApplication,
    IApplicationModule,
    IGetCoreApplicationsParams
} from '../../_types/application';
import {ErrorFieldDetail, Errors} from '../../_types/errors';
import {TriggerNames} from '../../_types/eventsManager';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';

export const MAX_CONSULTATION_HISTORY_SIZE = 10;

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
    getApplicationUrl(params: {application: IApplication; ctx: IQueryInfos}): string;
}

interface IDeps {
    'core.domain.permission.admin'?: IAdminPermissionDomain;
    'core.domain.user'?: IUserDomain;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.infra.application'?: IApplicationRepo;
    'core.utils'?: IUtils;
    translator?: i18n;
    config?: IConfig;
}

export default function ({
    'core.domain.permission.admin': adminPermissionDomain = null,
    'core.domain.user': userDomain = null,
    'core.domain.eventsManager': eventsManagerDomain = null,
    'core.infra.application': applicationRepo = null,
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
            applicationBefore?: IApplication;
            type: ApplicationEventTypes;
        },
        ctx: IQueryInfos
    ): Promise<void> => {
        const {application, applicationBefore, type} = params;

        const actionByType: {[key in ApplicationEventTypes]: EventAction} = {
            [ApplicationEventTypes.SAVE]: EventAction.APP_SAVE,
            [ApplicationEventTypes.DELETE]: EventAction.APP_DELETE
        };

        let appBeforeToSend = null;
        switch (type) {
            case ApplicationEventTypes.SAVE:
                appBeforeToSend = applicationBefore;
                break;
            case ApplicationEventTypes.DELETE:
                appBeforeToSend = application;
                break;
            default:
                break;
        }

        await eventsManagerDomain.sendPubSubEvent(
            {
                data: {
                    applicationEvent: {
                        type,
                        application
                    }
                },
                triggerName: TriggerNames.APPLICATION_EVENT
            },
            ctx
        );

        await eventsManagerDomain.sendDatabaseEvent(
            {
                action: actionByType[type],
                topic: {
                    application: application.id
                },
                before: appBeforeToSend ?? null,
                after: application ?? null
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
                type: ApplicationTypes.INTERNAL
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
                    applicationBefore: appProps,
                    type: ApplicationEventTypes.SAVE
                },
                ctx
            );

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
