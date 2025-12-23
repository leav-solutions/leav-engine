// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type i18n} from 'i18next';
import {type IPermissionRepo} from 'infra/permission/permissionRepo';
import {type IConfig} from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {adminUserId, systemUserId} from '../../_constants/users';
import {ECacheType, type ICachesService} from '../../infra/cache/cacheService';
import {Errors} from '../../_types/errors';
import {
    AdminPermissionsActions,
    ApplicationPermissionsActions,
    AttributeDependentValuesPermissionsActions,
    AttributePermissionsActions,
    type ILabeledPermissionsAction,
    type IPermission,
    LibraryPermissionsActions,
    type PermissionsActions,
    PermissionTypes,
    RecordAttributePermissionsActions,
    RecordPermissionsActions,
    TreeNodePermissionsActions,
    TreePermissionsActions,
} from '../../_types/permissions';
import {type IAdminPermissionDomain} from './adminPermissionDomain';
import {type IApplicationPermissionDomain} from './applicationPermissionDomain';
import {type IAttributePermissionDomain} from './attributePermissionDomain';
import {type IAttributeDependentValuesPermissionDomain} from './attributeDependentValuesPermissionDomain';
import getPermissionCachePatternKey from './helpers/getPermissionCachePatternKey';
import {type ILibraryPermissionDomain} from './libraryPermissionDomain';
import {type IRecordAttributePermissionDomain} from './recordAttributePermissionDomain';
import {type IRecordPermissionDomain} from './recordPermissionDomain';
import {type ITreeLibraryPermissionDomain} from './treeLibraryPermissionDomain';
import {type ITreeNodePermissionDomain} from './treeNodePermissionDomain';
import {type ITreePermissionDomain} from './treePermissionDomain';
import {
    type IGetActionsByTypeParams,
    type IGetInheritedPermissionsParams,
    type IGetPermissionsByActionsParams,
    type IIsAllowedParams,
    type PermByActionsRes,
} from './_types';
import {type IDefaultPermissionHelper} from './helpers/defaultPermission';

export interface IPermissionDomain {
    savePermission(permData: IPermission, ctx: IQueryInfos): Promise<IPermission>;
    getPermissionsByActions({
        type,
        applyTo,
        actions,
        usersGroupNodeId,
        permissionTreeTarget,
        dependenciesTreeTargets,
        ctx,
    }: IGetPermissionsByActionsParams): Promise<PermByActionsRes>;

    /**
     * Retrieve herited permission: ignore permission defined on given element, force retrieval of herited permission
     */
    getInheritedPermissions({
        type,
        applyTo,
        action,
        userGroupId,
        permissionTreeTarget,
        dependenciesTreeTargets,
        ctx,
    }: IGetInheritedPermissionsParams): Promise<boolean>;

    isAllowed({type, action, applyTo, target, ctx}: IIsAllowedParams): Promise<boolean>;

    getActionsByType(params: IGetActionsByTypeParams): Promise<ILabeledPermissionsAction[]>;

    registerActions(type: PermissionTypes, actions: string[], applyOn?: string[]): void;

    isAdminOrSystemUser(ctx: IQueryInfos): boolean;
}

export interface IPermissionDomainDeps {
    'core.domain.permission.admin': IAdminPermissionDomain;
    'core.domain.permission.library': ILibraryPermissionDomain;
    'core.domain.permission.record': IRecordPermissionDomain;
    'core.domain.permission.attribute': IAttributePermissionDomain;
    'core.domain.permission.attributeDependentValues': IAttributeDependentValuesPermissionDomain;
    'core.domain.permission.recordAttribute': IRecordAttributePermissionDomain;
    'core.domain.permission.tree': ITreePermissionDomain;
    'core.domain.permission.treeNode': ITreeNodePermissionDomain;
    'core.domain.permission.treeLibrary': ITreeLibraryPermissionDomain;
    'core.domain.permission.application': IApplicationPermissionDomain;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.infra.permission': IPermissionRepo;
    'core.infra.cache.cacheService': ICachesService;
    translator: i18n;
    config: IConfig;
}

export default function (deps: IPermissionDomainDeps): IPermissionDomain {
    const _pluginPermissions: {[type in PermissionTypes]?: Array<{name: string; applyOn?: string[]}>} = {};

    const {
        'core.domain.permission.admin': adminPermissionDomain,
        'core.domain.permission.record': recordPermissionDomain,
        'core.domain.permission.library': libraryPermissionDomain,
        'core.domain.permission.attribute': attributePermissionDomain,
        'core.domain.permission.attributeDependentValues': attributeDependentValuesPermissionDomain,
        'core.domain.permission.recordAttribute': recordAttributePermissionDomain,
        'core.domain.permission.tree': treePermissionDomain,
        'core.domain.permission.treeNode': treeNodePermissionDomain,
        'core.domain.permission.treeLibrary': treeLibraryPermissionDomain,
        'core.domain.permission.application': applicationPermissionDomain,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
        'core.domain.eventsManager': eventsManagerDomain,
        'core.infra.permission': permissionRepo,
        'core.infra.cache.cacheService': cacheService,
        config,
    }: IPermissionDomainDeps = deps;

    const _cleanCacheOnSavingPermissions = async (permissionData: IPermission) => {
        const {applyTo, type, actions} = permissionData;

        // clean cached permissions
        for (const actionName of Object.keys(actions)) {
            const patternKeys: string[] = [];

            patternKeys.push(
                getPermissionCachePatternKey({
                    permissionType: type,
                    applyTo,
                    permissionAction: actionName as PermissionsActions,
                }),
            );

            if (type === PermissionTypes.TREE) {
                patternKeys.push(
                    getPermissionCachePatternKey({
                        permissionType: PermissionTypes.TREE_LIBRARY,
                        applyTo,
                        permissionAction: actionName as PermissionsActions,
                    }),
                    getPermissionCachePatternKey({
                        permissionType: PermissionTypes.TREE_NODE,
                        applyTo,
                        permissionAction: actionName as PermissionsActions,
                    }),
                );
            }

            if (type === PermissionTypes.LIBRARY) {
                patternKeys.push(
                    getPermissionCachePatternKey({
                        permissionType: PermissionTypes.RECORD,
                        applyTo,
                        permissionAction: actionName as PermissionsActions,
                    }),
                );
            }

            if (type === PermissionTypes.ATTRIBUTE) {
                patternKeys.push(
                    getPermissionCachePatternKey({
                        permissionType: PermissionTypes.RECORD_ATTRIBUTE,
                        applyTo,
                        permissionAction: actionName as PermissionsActions,
                    }),
                );
            }

            if (type === PermissionTypes.APPLICATION) {
                patternKeys.push(
                    getPermissionCachePatternKey({
                        permissionType: PermissionTypes.APPLICATION,
                        applyTo,
                        permissionAction: actionName as PermissionsActions,
                    }),
                );
            }

            await cacheService.getCache(ECacheType.RAM).deleteData(patternKeys);
        }
    };

    const savePermission: IPermissionDomain['savePermission'] = async (permData, ctx) => {
        // Does user have the permission to save permissions?
        const action = AdminPermissionsActions.EDIT_PERMISSION;
        const canSavePermission = await adminPermissionDomain.getAdminPermission({
            action,
            ctx,
        });

        if (!canSavePermission) {
            throw new PermissionError(action);
        }

        await _cleanCacheOnSavingPermissions(permData);

        const savedPermission = await permissionRepo.savePermission({permData, ctx});

        await eventsManagerDomain.sendDatabaseEvent<EventAction.PERMISSION_SAVE>(
            {
                action: EventAction.PERMISSION_SAVE,
                topic: {
                    permission: {
                        type: permData.type,
                        applyTo: permData.applyTo,
                    },
                },
                after: savedPermission,
            },
            ctx,
        );

        return savedPermission;
    };

    const getPermissionsByActions = async (params: IGetPermissionsByActionsParams): Promise<PermByActionsRes> => {
        const {
            type,
            applyTo,
            actions,
            usersGroupNodeId: usersGroupId,
            permissionTreeTarget,
            dependenciesTreeTargets,
            ctx,
        } = params;

        const canAccessPermissions = await adminPermissionDomain.getAdminPermission({
            action: AdminPermissionsActions.ACCESS_PERMISSIONS,
            ctx,
        });

        if (!canAccessPermissions) {
            throw new PermissionError(AdminPermissionsActions.ACCESS_PERMISSIONS);
        }

        const perms = await permissionRepo.getPermissions({
            type,
            applyTo,
            usersGroupNodeId: usersGroupId,
            permissionTreeTarget,
            dependenciesTreeTargets,
            ctx,
        });

        return actions.reduce((actionsPerms, action) => {
            const forcedAdminDefaultPermission = defaultPermHelper.getAdminDefaultPermissionOrNull({
                type,
                action,
                userGroups: [[{id: usersGroupId}]],
                ctx,
            });
            actionsPerms[action] =
                perms !== null && typeof perms.actions[action] !== 'undefined'
                    ? (perms.actions[action] ?? forcedAdminDefaultPermission)
                    : forcedAdminDefaultPermission;

            return actionsPerms;
        }, {});
    };

    const getInheritedPermissions = async ({
        type,
        applyTo,
        action,
        userGroupId,
        permissionTreeTarget,
        dependenciesTreeTargets,
        ctx,
    }: IGetInheritedPermissionsParams): Promise<boolean> => {
        const canAccessPermissions = await adminPermissionDomain.getAdminPermission({
            action: AdminPermissionsActions.ACCESS_PERMISSIONS,
            ctx,
        });

        if (!canAccessPermissions) {
            throw new PermissionError(AdminPermissionsActions.ACCESS_PERMISSIONS);
        }

        let perm: boolean;
        switch (type) {
            case PermissionTypes.RECORD:
                perm = await recordPermissionDomain.getInheritedRecordPermission({
                    action: action as RecordPermissionsActions,
                    userGroupId,
                    library: applyTo,
                    permTree: permissionTreeTarget.tree,
                    permTreeNode: permissionTreeTarget.nodeId,
                    ctx,
                });
                break;
            case PermissionTypes.RECORD_ATTRIBUTE:
                perm = await recordAttributePermissionDomain.getInheritedRecordAttributePermission(
                    {
                        attributeId: applyTo,
                        action: action as RecordAttributePermissionsActions,
                        userGroupId,
                        permTree: permissionTreeTarget.tree,
                        permTreeNode: permissionTreeTarget.nodeId,
                    },
                    ctx,
                );
                break;
            case PermissionTypes.LIBRARY:
                action = action as LibraryPermissionsActions;
                perm = await libraryPermissionDomain.getInheritedLibraryPermission({
                    action,
                    libraryId: applyTo,
                    userGroupId,
                    ctx,
                });
                break;
            case PermissionTypes.ATTRIBUTE:
                action = action as AttributePermissionsActions;
                perm = await attributePermissionDomain.getInheritedAttributePermission({
                    action,
                    attributeId: applyTo,
                    userGroupId,
                    ctx,
                });
                break;
            case PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES:
                perm = await attributeDependentValuesPermissionDomain.getInheritedAttributeDependentValuesPermission({
                    action: action as AttributeDependentValuesPermissionsActions,
                    attributeId: applyTo,
                    userGroupId,
                    permissionTreeTarget,
                    dependenciesTreeTargets,
                    ctx,
                });
                break;
            case PermissionTypes.ADMIN:
                action = action as AdminPermissionsActions;
                perm = await adminPermissionDomain.getInheritedAdminPermission({
                    action,
                    userGroupId,
                    ctx,
                });
                break;
            case PermissionTypes.TREE:
                perm = await treePermissionDomain.getInheritedTreePermission({
                    action: action as TreePermissionsActions,
                    treeId: applyTo,
                    userGroupId,
                    ctx,
                });
                break;
            case PermissionTypes.TREE_NODE: {
                const [treeId, libraryId] = applyTo.split('/');

                perm = await treeNodePermissionDomain.getInheritedTreeNodePermission({
                    action: action as TreeNodePermissionsActions,
                    treeId,
                    libraryId,
                    userGroupId,
                    permTree: permissionTreeTarget.tree,
                    permTreeNode: permissionTreeTarget.nodeId,
                    ctx,
                });
                break;
            }
            case PermissionTypes.TREE_LIBRARY: {
                const [treeId, libraryId] = applyTo.split('/');

                perm = await treeLibraryPermissionDomain.getInheritedTreeLibraryPermission({
                    action: action as TreeNodePermissionsActions,
                    treeId,
                    libraryId,
                    userGroupId,
                    ctx,
                });
                break;
            }
            case PermissionTypes.APPLICATION: {
                action = action as ApplicationPermissionsActions;
                perm = await applicationPermissionDomain.getInheritedApplicationPermission({
                    action,
                    applicationId: applyTo,
                    userGroupId,
                    ctx,
                });
                break;
            }
            default:
                throw new Error(`Getting inherited permissions not implemented for type ${type}`);
        }

        return perm;
    };

    const isAllowed = async ({type, action, applyTo, target, ctx}: IIsAllowedParams): Promise<boolean> => {
        let perm: boolean;
        const errors: string[] = [];

        switch (type) {
            case PermissionTypes.RECORD:
                if (!target || !target.recordId) {
                    throw new ValidationError({target: Errors.MISSING_RECORD_ID});
                }

                perm = await recordPermissionDomain.getRecordPermission({
                    action: action as RecordPermissionsActions,
                    library: applyTo,
                    recordId: target.recordId,
                    ctx,
                });
                break;
            case PermissionTypes.RECORD_ATTRIBUTE:
                if (!target) {
                    throw new ValidationError({target: Errors.MISSING_TARGET});
                }

                if (!target.recordId) {
                    errors.push('recordId');
                }

                if (!target.attributeId) {
                    errors.push('attributeId');
                }

                if (errors.length) {
                    throw new ValidationError({
                        target: {msg: Errors.MISSING_FIELDS, vars: {fields: errors.join(', ')}},
                    });
                }

                perm = await recordAttributePermissionDomain.getRecordAttributePermission(
                    action as RecordAttributePermissionsActions,
                    target.attributeId,
                    applyTo,
                    target.recordId,
                    ctx,
                );

                break;
            case PermissionTypes.LIBRARY:
                action = action as LibraryPermissionsActions;
                perm = await libraryPermissionDomain.getLibraryPermission({
                    action,
                    libraryId: applyTo,
                    ctx,
                });
                break;
            case PermissionTypes.ATTRIBUTE:
                action = action as AttributePermissionsActions;
                perm = await attributePermissionDomain.getAttributePermission({
                    action,
                    attributeId: applyTo,
                    ctx,
                });

                break;
            case PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES:
                action = action as AttributeDependentValuesPermissionsActions;
                if (!target) {
                    throw new ValidationError({target: Errors.MISSING_TARGET});
                }

                if (!target.recordId) {
                    errors.push('recordId');
                }

                if (!target.libraryId) {
                    errors.push('libraryId');
                }

                if (errors.length) {
                    throw new ValidationError({
                        target: {msg: Errors.MISSING_FIELDS, vars: {fields: errors.join(', ')}},
                    });
                }

                perm = await attributeDependentValuesPermissionDomain.getAttributeDependentValuesPermission({
                    action,
                    attributeId: applyTo,
                    recordLibrary: target.libraryId,
                    recordId: target.recordId,
                    valueNodeId: target.nodeId, // may be null
                    ctx,
                });

                break;
            case PermissionTypes.ADMIN:
                action = action as AdminPermissionsActions;
                perm = await adminPermissionDomain.getAdminPermission({
                    action,
                    ctx,
                });
                break;
            case PermissionTypes.TREE:
                action = action as TreePermissionsActions;
                perm = await treePermissionDomain.getTreePermission({
                    action,
                    treeId: applyTo,
                    ctx,
                });
                break;
            case PermissionTypes.TREE_NODE:
                if (!target.nodeId) {
                    throw new ValidationError({
                        target: {msg: Errors.MISSING_FIELDS, vars: {fields: 'nodeId'}},
                    });
                }

                perm = await treeNodePermissionDomain.getTreeNodePermission({
                    action: action as TreeNodePermissionsActions,
                    treeId: applyTo,
                    nodeId: target.nodeId,
                    ctx,
                });
                break;
            case PermissionTypes.TREE_LIBRARY:
                const [treeId, libraryId] = applyTo.split('/');

                perm = await treeLibraryPermissionDomain.getTreeLibraryPermission({
                    action: action as TreeNodePermissionsActions,
                    treeId,
                    libraryId,
                    ctx,
                });
                break;
            case PermissionTypes.APPLICATION:
                action = action as ApplicationPermissionsActions;
                perm = await applicationPermissionDomain.getApplicationPermission({
                    action,
                    applicationId: applyTo,
                    ctx,
                });
                break;
            default:
                throw new Error(`isAllowed not implemented for type ${type}`);
        }

        return perm;
    };

    const getActionsByType = async ({
        type,
        applyOn,
        ctx,
        skipApplyOn = false,
    }: IGetActionsByTypeParams): Promise<ILabeledPermissionsAction[]> => {
        const canAccessPermissions = await adminPermissionDomain.getAdminPermission({
            action: AdminPermissionsActions.ACCESS_PERMISSIONS,
            ctx,
        });

        if (!canAccessPermissions) {
            throw new PermissionError(AdminPermissionsActions.ACCESS_PERMISSIONS);
        }

        let perms = [];
        switch (type) {
            case PermissionTypes.ADMIN:
                perms = Object.values(AdminPermissionsActions);
                break;
            case PermissionTypes.LIBRARY:
                perms = Object.values(LibraryPermissionsActions);
                break;
            case PermissionTypes.RECORD:
                perms = Object.values(RecordPermissionsActions);
                break;
            case PermissionTypes.ATTRIBUTE:
                perms = Object.values(AttributePermissionsActions);
                break;
            case PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES:
                perms = Object.values(AttributeDependentValuesPermissionsActions);
                break;
            case PermissionTypes.RECORD_ATTRIBUTE:
                perms = Object.values(RecordAttributePermissionsActions);
                break;
            case PermissionTypes.TREE:
                perms = Object.values(TreePermissionsActions);
                break;
            case PermissionTypes.TREE_LIBRARY:
            case PermissionTypes.TREE_NODE:
                perms = Object.values(TreeNodePermissionsActions);
                break;
            case PermissionTypes.APPLICATION:
                perms = Object.values(ApplicationPermissionsActions);
                break;
            default:
                throw new Error(`Getting actions by type not implemented for type ${type}`);
        }

        // Retrieve plugin permissions, applying filter if applyOn is specified
        const pluginPermissions = (_pluginPermissions[type] ?? [])
            .filter(p => skipApplyOn || !p.applyOn || p.applyOn.indexOf(applyOn) !== -1)
            .map(p => p.name);

        return [...perms, ...pluginPermissions].map(p => ({
            name: p,
            label: config.lang.available.reduce(
                // Retrieve label for all available languages
                (acc, l) => ({
                    ...acc,
                    [l]: deps.translator.t(`permissions.${p}`, {lng: l}),
                }),
                {},
            ),
        }));
    };

    const registerActions = (type: PermissionTypes, actions: string[], applyOn?: string[]) => {
        _pluginPermissions[type] = [...(_pluginPermissions[type] ?? []), ...actions.map(a => ({name: a, applyOn}))];
    };

    const isAdminOrSystemUser = (ctx: IQueryInfos): boolean =>
        ctx.userId === adminUserId || ctx.userId === systemUserId;

    return {
        savePermission,
        getPermissionsByActions,
        getInheritedPermissions,
        isAllowed,
        getActionsByType,
        registerActions,
        isAdminOrSystemUser,
    };
}
