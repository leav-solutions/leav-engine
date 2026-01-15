// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IPermissionDomain} from 'domain/permission/permissionDomain';
import {type IQueryInfos} from '_types/queryInfos';
import {type IApplication} from '../../_types/application';
import {LibraryPermissionsActions, PermissionTypes, RecordPermissionsActions} from '../../_types/permissions';

export interface IAppStudioDomain {
    /**
     * Extract and filter appStudioSettings from application settings.
     * Filters workspaces based on user permissions (ACCESS_LIBRARY for library type, ACCESS_RECORD for record type)
     */
    getAppStudioSettings(params: {
        application: IApplication;
        ctx: IQueryInfos;
    }): Promise<IApplication['appStudioSettings']>;
}

export interface IAppStudioDomainDeps {
    'core.domain.permission': IPermissionDomain;
}

export default function ({'core.domain.permission': permissionDomain}: IAppStudioDomainDeps): IAppStudioDomain {
    const _filterWorkspacesByPermissions = async (
        appStudioSettings: IApplication['appStudioSettings'],
        ctx: IQueryInfos,
    ): Promise<IApplication['appStudioSettings']> => {
        if (!appStudioSettings?.workspaces || !Array.isArray(appStudioSettings.workspaces)) {
            return appStudioSettings;
        }

        const workspaces = appStudioSettings.workspaces;

        const filteredWorkspaces = await Promise.all(
            workspaces.map(async workspace => {
                let canAccess = false;

                if (workspace.type === 'record') {
                    canAccess = await permissionDomain.isAllowed({
                        type: PermissionTypes.RECORD,
                        action: RecordPermissionsActions.ACCESS_RECORD,
                        applyTo: workspace.libraryId,
                        target: {
                            recordId: workspace.recordId,
                        },
                        ctx,
                    });
                }

                if (workspace.type === 'library') {
                    canAccess = await permissionDomain.isAllowed({
                        type: PermissionTypes.LIBRARY,
                        action: LibraryPermissionsActions.ACCESS_LIBRARY,
                        applyTo: workspace.libraryId,
                        ctx,
                    });
                }

                return canAccess ? workspace : null;
            }),
        );

        return {
            ...appStudioSettings,
            workspaces: filteredWorkspaces.filter(workspace => workspace !== null),
        };
    };

    return {
        async getAppStudioSettings({application, ctx}) {
            const appStudioSettings = application.settings?.application ?? {};

            return _filterWorkspacesByPermissions(appStudioSettings, ctx);
        },
    };
}
