// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IPermissionDomain} from '../../domain/permission/permissionDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IApplication} from '../../_types/application';
import {type ILibraryDomain} from '../../domain/library/libraryDomain';
import {type IRecordDomain} from '../../domain/record/recordDomain';
import {LibraryPermissionsActions, PermissionTypes, RecordPermissionsActions} from '../../_types/permissions';
import {type IConfig} from '../../_types/config';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';

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
    config: IConfig;
    'core.domain.permission': IPermissionDomain;
    'core.domain.library': ILibraryDomain;
    'core.domain.record': IRecordDomain;
}

export default function ({
    config,
    'core.domain.permission': permissionDomain,
    'core.domain.library': libraryDomain,
    'core.domain.record': recordDomain,
}: IAppStudioDomainDeps): IAppStudioDomain {
    const _filterWorkspacesByPermissions = async (
        workspaces: IApplication['appStudioSettings']['workspaces'],
        ctx: IQueryInfos,
    ) => {
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

        return filteredWorkspaces.filter(workspace => workspace !== null);
    };

    const _setWorkspacesTitles = async (
        workspaces: IApplication['appStudioSettings']['workspaces'],
        ctx: IQueryInfos,
    ) =>
        Promise.all(
            workspaces.map(async workspace => {
                if (workspace.title) {
                    return workspace;
                }

                if (!workspace.libraryId) {
                    throw new ValidationError<IApplication>({
                        id: {msg: Errors.APP_STUDIO_WORKSPACE_LIBRARY_ID_REQUIRED, vars: {workspaceId: workspace.id}},
                    });
                }

                if (workspace.type === 'library' || !workspace.type) {
                    const libraryProperties = await libraryDomain.getLibraryProperties(workspace.libraryId, ctx);

                    return {
                        ...workspace,
                        title: libraryProperties.label,
                    };
                }

                if (!workspace.recordId) {
                    throw new ValidationError<IApplication>({
                        id: {msg: Errors.APP_STUDIO_WORKSPACE_RECORD_ID_REQUIRED, vars: {workspaceId: workspace.id}},
                    });
                }

                if (workspace.type === 'record') {
                    const recordProperties = await recordDomain.getRecordIdentity(
                        {
                            id: workspace.recordId,
                            library: workspace.libraryId,
                        },
                        ctx,
                    );

                    const recordLabel = (await recordProperties.getLabel?.()) ?? workspace.recordId;

                    return {
                        ...workspace,
                        title: Object.fromEntries(config.lang.available.map(lang => [lang, recordLabel])),
                    };
                }
            }),
        );

    const _getAppStudioSettings = async (
        appStudioSettings: IApplication['appStudioSettings'],
        ctx: IQueryInfos,
    ): Promise<IApplication['appStudioSettings']> => {
        if (!appStudioSettings?.workspaces || !Array.isArray(appStudioSettings.workspaces)) {
            return appStudioSettings;
        }

        let workspaces = appStudioSettings.workspaces;

        workspaces = await _filterWorkspacesByPermissions(workspaces, ctx);
        workspaces = await _setWorkspacesTitles(workspaces, ctx);

        return {
            ...appStudioSettings,
            workspaces,
        };
    };

    return {
        async getAppStudioSettings({application, ctx}) {
            const appStudioSettings = application.settings?.application ?? {};

            return _getAppStudioSettings(appStudioSettings, ctx);
        },
    };
}
