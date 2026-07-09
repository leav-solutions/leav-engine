import {type IPermissionDomain} from '../../domain/permission/permissionDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IApplication} from '../../_types/application';
import {type ILibraryDomain} from '../../domain/library/libraryDomain';
import {type IRecordDomain} from '../../domain/record/recordDomain';
import {type ITreeDomain} from '../../domain/tree/treeDomain';
import {LibraryPermissionsActions, PermissionTypes, RecordPermissionsActions} from '../../_types/permissions';
import {type IConfig} from '../../_types/config';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import uniq from 'lodash/uniq';
import {type IGetLibrarySystemPanelsHelper} from './helpers/getLibrarySystemPanels';
import {EXPLORER_STUDIO_APPLICATION} from '../../_constants/globalSettings';

// FontAwesome icon distinguishing tree workspaces from library workspaces in the navigation menu.
const TREE_WORKSPACE_ICON = 'fa-sitemap';

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
    'core.domain.tree': ITreeDomain;
    'core.domain.application.helpers.getLibrarySystemPanels': IGetLibrarySystemPanelsHelper;
}

export default function ({
    config,
    'core.domain.permission': permissionDomain,
    'core.domain.library': libraryDomain,
    'core.domain.record': recordDomain,
    'core.domain.tree': treeDomain,
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

                if (workspace.type === 'tree') {
                    // Tree workspaces are only produced by the explorer-studio auto-populate, which
                    // sources them from treeDomain.getTrees — already filtered by ACCESS_TREE permission.
                    canAccess = true;
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
                if (workspace.type === 'tree') {
                    const title = workspace.title ?? (await treeDomain.getTreeProperties(workspace.treeId, ctx)).label;

                    return {
                        ...workspace,
                        title,
                    };
                }

                if (!workspace.libraryId) {
                    throw new ValidationError<IApplication>({
                        id: {msg: Errors.APP_STUDIO_WORKSPACE_LIBRARY_ID_REQUIRED, vars: {workspaceId: workspace.id}},
                    });
                }

                if (workspace.type === 'library' || !workspace.type) {
                    const title =
                        workspace.title ?? (await libraryDomain.getLibraryProperties(workspace.libraryId, ctx)).label;

                    return {
                        ...workspace,
                        title,
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

                    const rawRecordLabel = (await recordProperties.getLabel?.()) ?? workspace.recordId;
                    const recordLabel = rawRecordLabel !== null ? String(rawRecordLabel) : null;
                    const title =
                        workspace.title ?? Object.fromEntries(config.lang.available.map(lang => [lang, recordLabel]));

                    const rawRecordSubTitle = (await recordProperties.getSubLabel?.()) ?? null;
                    const recordSubTitle = rawRecordSubTitle !== null ? String(rawRecordSubTitle) : null;
                    const subTitle =
                        workspace.subTitle ??
                        (recordSubTitle
                            ? Object.fromEntries(config.lang.available.map(lang => [lang, recordSubTitle]))
                            : undefined);

                    return {
                        ...workspace,
                        title,
                        subTitle,
                    };
                }

                return workspace;
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
            librarySystemPanelsHelper.getLibrarySystemPanels(libraryId, applicationId);

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

        // getTrees is already filtered by the ACCESS_TREE permission, so unauthorized trees never surface.
        const trees = (await treeDomain.getTrees({ctx}))?.list ?? [];

        for (const tree of trees) {
            explorerStudioWorkspaces.push({
                // `_tree_workspace` suffix (not `_workspace`) so a tree and a library sharing the same id
                // don't produce colliding workspace ids (checkWorkspaceIdsUniqueness on the front).
                id: `${tree.id}_tree_workspace`,
                type: 'tree',
                treeId: tree.id,
                icon: TREE_WORKSPACE_ICON,
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

        // Explorer studio auto-populates workspaces with no meaningful order, so sort them alphabetically
        // (mixing both types) by their resolved title. Other instances keep their configured order.
        if (applicationId === EXPLORER_STUDIO_APPLICATION) {
            workspaces = [...workspaces].sort((a, b) => {
                const titleA = a.title?.[config.lang.default] ?? '';
                const titleB = b.title?.[config.lang.default] ?? '';
                return titleA.localeCompare(titleB);
            });
        }

        // Tree workspaces have no library (their treeExplorer panel is built implicitly by the front),
        // so only library/record workspaces contribute to the library panels lookup below.
        const librariesIds = uniq(
            workspaces
                .map(workspace => workspace.libraryId)
                .filter((libraryId): libraryId is NonNullable<typeof libraryId> => libraryId != null),
        );
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
