// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {IApplicationRepo} from 'infra/application/applicationRepo';
import {IUtils} from 'utils/utils';
import {IApplication} from '_types/application';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ErrorFieldDetail, Errors} from '../../_types/errors';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';

const protectedEndpoints = ['login', 'portal'];
export interface IApplicationDomain {
    getApplicationProperties(params: {id: string; ctx: IQueryInfos}): Promise<IApplication>;

    /**
     * Get applications list, filtered or not
     */
    getApplications(params: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<IApplication>>;

    /**
     * Save application.
     * If application doesn't exist => create a new one, otherwise update existing
     */
    saveApplication(params: {applicationData: IApplication; ctx: IQueryInfos}): Promise<IApplication>;
    deleteApplication({id, ctx}: {id: string; ctx: IQueryInfos}): Promise<IApplication>;
}

interface IDeps {
    'core.domain.permission.admin'?: IAdminPermissionDomain;
    'core.infra.application'?: IApplicationRepo;
    'core.utils'?: IUtils;
}

export default function ({
    'core.domain.permission.admin': adminPermissionDomain = null,
    'core.infra.application': applicationRepo = null,
    'core.utils': utils = null
}: IDeps = {}): IApplicationDomain {
    return {
        async getApplicationProperties({id, ctx}) {
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

            const defaultParams = {
                id: '',
                system: false
            };

            const appProps: IApplication = apps.list[0] ?? null;
            const appToSave: IApplication = isExistingApp
                ? {
                      ...defaultParams,
                      ...appProps,
                      ...applicationData
                  }
                : {...defaultParams, ...applicationData};

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

            if (!utils.isIdValid(appToSave.id)) {
                errors.id = Errors.INVALID_ID_FORMAT;
            }

            if (!utils.isEndpointValid(appToSave.endpoint)) {
                errors.id = Errors.INVALID_ENDPOINT_FORMAT;
            }

            if (protectedEndpoints.includes(applicationData.endpoint)) {
                errors.endpoint = {msg: Errors.PROTECTED_ENDPOINT, vars: {endpoint: applicationData.endpoint}};
            }

            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            // If doesn't exist, we create it. Otherwise, update it
            return isExistingApp
                ? applicationRepo.updateApplication({applicationData: appToSave, ctx})
                : applicationRepo.createApplication({applicationData: appToSave, ctx});
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

            return applicationRepo.deleteApplication({id, ctx});
        }
    };
}
