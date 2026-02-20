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
import uniq from 'lodash/uniq';
import {type IGetLibrarySystemPanelsHelper} from './helpers/getLibrarySystemPanels';
import {EXPLORER_STUDIO_APPLICATION} from '_constants/globalSettings';

export interface IAppStudioDomain {
    /**
     * Extract and dynamically generate appStudioSettings from application and libraries settings.
     *
     * Also:
     * - Filters workspaces based on user permissions (ACCESS_LIBRARY for library type, ACCESS_RECORD for record type).
     * - Sets titles for workspaces if not provided.
     * - Recursively gets library panels based on workspaces and library recordsPanels.
     */
    getAppStudioSettings(params: {
        application: IApplication;
        ctx: IQueryInfos;
    }): Promise<IApplication['appStudioSettings']>;
    /**
     * Check if application has defined panels on each library and delete them
     */
    deleteLibraryPanelsForApplication(params: {applicationId: string; ctx: IQueryInfos}): Promise<void>;
}

export interface IAppStudioDomainDeps {
    config: IConfig;
    'core.domain.permission': IPermissionDomain;
    'core.domain.library': ILibraryDomain;
    'core.domain.record': IRecordDomain;
    'core.domain.application.helpers.getLibrarySystemPanels': IGetLibrarySystemPanelsHelper;
}

export default function ({
    config,
    'core.domain.permission': permissionDomain,
    'core.domain.library': libraryDomain,
    'core.domain.record': recordDomain,
    'core.domain.application.helpers.getLibrarySystemPanels': librarySystemPanelsHelper,
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

    const _getLibraryPanelsRecursively = async (
        libraryId: string,
        applicationId: string,
        processedLibraryIds: Set<string>,
        ctx: IQueryInfos,
    ): Promise<Record<string, IApplication['appStudioSettings']>> => {
        const library = await libraryDomain.getLibraryProperties(libraryId, ctx);

        const libraryPanels =
            library.settings?.applications?.[applicationId] ??
            librarySystemPanelsHelper.getLibrarySystemPanels(libraryId);

        let result = {
            [libraryId]: libraryPanels,
        };

        const recordPanelsWithLibraryId =
            libraryPanels?.recordPanels
                ?.filter(panel => 'libraryId' in panel && panel.libraryId && !processedLibraryIds.has(panel.libraryId))
                .map(panel => panel.libraryId) ?? [];

        for (const recordPanelLibraryId of recordPanelsWithLibraryId) {
            processedLibraryIds.add(recordPanelLibraryId);

            result = {
                ...result,
                ...(await _getLibraryPanelsRecursively(recordPanelLibraryId, applicationId, processedLibraryIds, ctx)),
            };
        }

        return result;
    };

    const _autoPopulateWorkspacesForExplorerStudio = async (ctx: IQueryInfos) => {
        const explorerStudioWorkspaces = [];

        const libraries = (await libraryDomain.getLibraries({ctx}))?.list ?? [];

        for (const library of libraries) {
            explorerStudioWorkspaces.push({
                id: `${library.id}_workspace`,
                type: 'library',
                libraryId: library.id,
            });
        }

        return explorerStudioWorkspaces;
    };

    const _getAppStudioSettings = async (
        applicationId: string,
        appStudioSettings: IApplication['appStudioSettings'],
        ctx: IQueryInfos,
    ): Promise<IApplication['appStudioSettings']> => {
        if (!appStudioSettings?.workspaces || !Array.isArray(appStudioSettings.workspaces)) {
            return appStudioSettings;
        }

        // For now, explorer studio support only auto-populate workspaces. It can't be overridden.
        let workspaces =
            applicationId === EXPLORER_STUDIO_APPLICATION
                ? await _autoPopulateWorkspacesForExplorerStudio(ctx)
                : appStudioSettings.workspaces;
        let librariesPanels = {};

        workspaces = await _filterWorkspacesByPermissions(workspaces, ctx);
        workspaces = await _setWorkspacesTitles(workspaces, ctx);

        const librariesIds = uniq(workspaces.map(workspace => workspace.libraryId));
        const processedLibraryIds = new Set<string>();

        for (const libraryId of librariesIds) {
            processedLibraryIds.add(libraryId);

            librariesPanels = {
                ...librariesPanels,
                ...(await _getLibraryPanelsRecursively(libraryId, applicationId, processedLibraryIds, ctx)),
            };
        }

        return {
            ...appStudioSettings,
            workspaces,
            libraries: librariesPanels,
        };
    };

    const _deleteLibraryPanelsForApplication = async (applicationId: string, ctx: IQueryInfos) => {
        const libraries = (await libraryDomain.getLibraries({ctx}))?.list ?? [];

        for (const library of libraries) {
            const applications = library.settings?.applications;

            if (!applications || !applications?.[applicationId]) {
                continue;
            }

            delete applications[applicationId];

            const librarySettingsToSave = {
                ...library.settings,
                applications,
            };

            if (!Object.keys(librarySettingsToSave.applications ?? {}).length) {
                delete librarySettingsToSave.applications;
            }

            await libraryDomain.saveLibrary({...library, settings: librarySettingsToSave}, ctx);
        }
    };

    return {
        async getAppStudioSettings({application, ctx}) {
            const appStudioSettings = application.settings?.application ?? {};

            return _getAppStudioSettings(application.id, appStudioSettings, ctx);
        },
        async deleteLibraryPanelsForApplication({applicationId, ctx}) {
            return _deleteLibraryPanelsForApplication(applicationId, ctx);
        },
    };
}
