// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {i18n} from 'i18next';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ECacheType, ICachesService} from '../../infra/cache/cacheService';
import {Errors} from '../../_types/errors';
import {
    AdminPermissionsActions,
    ApplicationPermissionsActions,
    AttributePermissionsActions,
    ILabeledPermissionsAction,
    IPermission,
    LibraryPermissionsActions,
    PermissionsActions,
    PermissionTypes,
    RecordAttributePermissionsActions,
    RecordPermissionsActions,
    TreeNodePermissionsActions,
    TreePermissionsActions
} from '../../_types/permissions';
import {IAdminPermissionDomain} from './adminPermissionDomain';
import {IApplicationPermissionDomain} from './applicationPermissionDomain';
import {IAttributePermissionDomain} from './attributePermissionDomain';
import getPermissionCachePatternKey from './helpers/getPermissionCachePatternKey';
import {ILibraryPermissionDomain} from './libraryPermissionDomain';
import {IRecordAttributePermissionDomain} from './recordAttributePermissionDomain';
import {IRecordPermissionDomain} from './recordPermissionDomain';
import {ITreeLibraryPermissionDomain} from './treeLibraryPermissionDomain';
import {ITreeNodePermissionDomain} from './treeNodePermissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';
import {
    IGetActionsByTypeParams,
    IGetInheritedPermissionsParams,
    IGetPermissionsByActionsParams,
    IIsAllowedParams,
    PermByActionsRes
} from './_types';

export interface IPermissionDomain {
    savePermission(permData: IPermission, ctx: IQueryInfos): Promise<IPermission>;
    getPermissionsByActions({
        type,
        applyTo,
        actions,
        usersGroupNodeId,
        permissionTreeTarget,
        ctx
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
        ctx
    }: IGetInheritedPermissionsParams): Promise<boolean>;

    isAllowed({type, action, userId, applyTo, target, ctx}: IIsAllowedParams): Promise<boolean>;

    getActionsByType(params: IGetActionsByTypeParams): ILabeledPermissionsAction[];

    registerActions(type: PermissionTypes, actions: string[], applyOn?: string[]): void;
}

export interface IDeps {
    'core.domain.permission.admin': IAdminPermissionDomain;
    'core.domain.permission.library': ILibraryPermissionDomain;
    'core.domain.permission.record': IRecordPermissionDomain;
    'core.domain.permission.attribute': IAttributePermissionDomain;
    'core.domain.permission.recordAttribute': IRecordAttributePermissionDomain;
    'core.domain.permission.tree': ITreePermissionDomain;
    'core.domain.permission.treeNode': ITreeNodePermissionDomain;
    'core.domain.permission.treeLibrary': ITreeLibraryPermissionDomain;
    'core.domain.permission.application': IApplicationPermissionDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.infra.permission': IPermissionRepo;
    'core.infra.cache.cacheService': ICachesService;
    translator: i18n;
    config: IConfig;
}

export default function (deps: IDeps): IPermissionDomain {
    const _pluginPermissions: {[type in PermissionTypes]?: Array<{name: string; applyOn?: string[]}>} = {};

    const {
        'core.domain.permission.admin': adminPermissionDomain,
        'core.domain.permission.record': recordPermissionDomain,
        'core.domain.permission.library': libraryPermissionDomain,
        'core.domain.permission.attribute': attributePermissionDomain,
        'core.domain.permission.recordAttribute': recordAttributePermissionDomain,
        'core.domain.permission.tree': treePermissionDomain,
        'core.domain.permission.treeNode': treeNodePermissionDomain,
        'core.domain.permission.treeLibrary': treeLibraryPermissionDomain,
        'core.domain.permission.application': applicationPermissionDomain,
        'core.domain.eventsManager': eventsManagerDomain,
        'core.infra.permission': permissionRepo,
        'core.infra.cache.cacheService': cacheService,
        config
    }: IDeps = deps;

    const _cleanCacheOnSavingPermissions = async (permData: IPermission) => {
        // clean permissions cached
        for (const [name, v] of Object.entries(permData.actions)) {
            const keys: string[] = [];

            keys.push(
                getPermissionCachePatternKey({
                    permissionType: permData.type,
                    applyTo: permData.applyTo,
                    permissionAction: name as PermissionsActions
                })
            );

            if (permData.type === PermissionTypes.TREE) {
                keys.push(
                    getPermissionCachePatternKey({
                        permissionType: PermissionTypes.TREE_LIBRARY,
                        applyTo: permData.applyTo,
                        permissionAction: name as PermissionsActions
                    }),
                    getPermissionCachePatternKey({
                        permissionType: PermissionTypes.TREE_NODE,
                        applyTo: permData.applyTo,
                        permissionAction: name as PermissionsActions
                    })
                );
            }

            if (permData.type === PermissionTypes.LIBRARY) {
                keys.push(
                    getPermissionCachePatternKey({
                        permissionType: PermissionTypes.RECORD,
                        applyTo: permData.applyTo,
                        permissionAction: name as PermissionsActions
                    })
                );
            }

            if (permData.type === PermissionTypes.ATTRIBUTE) {
                keys.push(
                    getPermissionCachePatternKey({
                        permissionType: PermissionTypes.RECORD_ATTRIBUTE,
                        applyTo: permData.applyTo,
                        permissionAction: name as PermissionsActions
                    })
                );
            }

            if (permData.type === PermissionTypes.APPLICATION) {
                keys.push(
                    getPermissionCachePatternKey({
                        permissionType: PermissionTypes.APPLICATION,
                        applyTo: permData.applyTo,
                        permissionAction: name as PermissionsActions
                    })
                );
            }

            await cacheService.getCache(ECacheType.RAM).deleteData(keys);
        }
    };

    const savePermission: IPermissionDomain['savePermission'] = async (permData, ctx) => {
        // Does user have the permission to save permissions?
        const action = AdminPermissionsActions.EDIT_PERMISSION;
        const canSavePermission = await adminPermissionDomain.getAdminPermission({
            action,
            userId: ctx.userId,
            ctx
        });

        if (!canSavePermission) {
            throw new PermissionError(action);
        }

        await _cleanCacheOnSavingPermissions(permData);

        const savedPermission = await permissionRepo.savePermission({permData, ctx});

        await eventsManagerDomain.sendDatabaseEvent(
            {
                action: EventAction.PERMISSION_SAVE,
                topic: {
                    permission: {
                        type: permData.type,
                        applyTo: permData.applyTo
                    }
                },
                after: savedPermission.actions
            },
            ctx
        );

        return savedPermission;
    };

    const getPermissionsByActions = async (params: IGetPermissionsByActionsParams): Promise<PermByActionsRes> => {
        const {type, applyTo, actions, usersGroupNodeId: usersGroupId, permissionTreeTarget, ctx} = params;

        const perms = await permissionRepo.getPermissions({
            type,
            applyTo,
            usersGroupNodeId: usersGroupId,
            permissionTreeTarget,
            ctx
        });

        return actions.reduce((actionsPerms, action) => {
            actionsPerms[action] =
                perms !== null && typeof perms.actions[action] !== 'undefined' ? perms.actions[action] : null;

            return actionsPerms;
        }, {});
    };

    const getInheritedPermissions = async ({
        type,
        applyTo,
        action,
        userGroupId,
        permissionTreeTarget,
        ctx
    }: IGetInheritedPermissionsParams): Promise<boolean> => {
        let perm;
        switch (type) {
            case PermissionTypes.RECORD:
                perm = await recordPermissionDomain.getInheritedRecordPermission({
                    action: action as RecordPermissionsActions,
                    userGroupId,
                    library: applyTo,
                    permTree: permissionTreeTarget.tree,
                    permTreeNode: permissionTreeTarget.nodeId,
                    ctx
                });
                break;
            case PermissionTypes.RECORD_ATTRIBUTE:
                perm = recordAttributePermissionDomain.getInheritedRecordAttributePermission(
                    {
                        attributeId: applyTo,
                        action: action as RecordAttributePermissionsActions,
                        userGroupId,
                        permTree: permissionTreeTarget.tree,
                        permTreeNode: permissionTreeTarget.nodeId
                    },
                    ctx
                );
                break;
            case PermissionTypes.LIBRARY:
                action = action as LibraryPermissionsActions;
                perm = await libraryPermissionDomain.getInheritedLibraryPermission({
                    action,
                    libraryId: applyTo,
                    userGroupId,
                    ctx
                });
                break;
            case PermissionTypes.ATTRIBUTE:
                action = action as AttributePermissionsActions;
                perm = await attributePermissionDomain.getInheritedAttributePermission({
                    action,
                    attributeId: applyTo,
                    userGroupId,
                    ctx
                });
                break;
            case PermissionTypes.ADMIN:
                action = action as AdminPermissionsActions;
                perm = await adminPermissionDomain.getInheritedAdminPermission({
                    action,
                    userGroupId,
                    ctx
                });
                break;
            case PermissionTypes.TREE:
                perm = await treePermissionDomain.getInheritedTreePermission({
                    action: action as TreePermissionsActions,
                    treeId: applyTo,
                    userGroupId,
                    ctx
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
                    ctx
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
                    ctx
                });
                break;
            }
            case PermissionTypes.APPLICATION: {
                action = action as ApplicationPermissionsActions;
                perm = await applicationPermissionDomain.getInheritedApplicationPermission({
                    action,
                    applicationId: applyTo,
                    userGroupId,
                    ctx
                });
                break;
            }
        }

        return perm;
    };

    const isAllowed = async ({type, action, userId, applyTo, target, ctx}: IIsAllowedParams): Promise<boolean> => {
        let perm;
        switch (type) {
            case PermissionTypes.RECORD:
                if (!target || !target.recordId) {
                    throw new ValidationError({target: Errors.MISSING_RECORD_ID});
                }

                perm = await recordPermissionDomain.getRecordPermission({
                    action: action as RecordPermissionsActions,
                    userId,
                    library: applyTo,
                    recordId: target.recordId,
                    ctx
                });
                break;
            case PermissionTypes.RECORD_ATTRIBUTE:
                const errors: string[] = [];
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
                        target: {msg: Errors.MISSING_FIELDS, vars: {fields: errors.join(', ')}}
                    });
                }

                perm = recordAttributePermissionDomain.getRecordAttributePermission(
                    action as RecordAttributePermissionsActions,
                    userId,
                    target.attributeId,
                    applyTo,
                    target.recordId,
                    ctx
                );

                break;
            case PermissionTypes.LIBRARY:
                action = action as LibraryPermissionsActions;
                perm = await libraryPermissionDomain.getLibraryPermission({
                    action,
                    libraryId: applyTo,
                    userId,
                    ctx
                });
                break;
            case PermissionTypes.ATTRIBUTE:
                action = action as AttributePermissionsActions;
                perm = await attributePermissionDomain.getAttributePermission({
                    action,
                    attributeId: applyTo,
                    ctx
                });

                break;
            case PermissionTypes.ADMIN:
                action = action as AdminPermissionsActions;
                perm = await adminPermissionDomain.getAdminPermission({
                    action,
                    userId,
                    ctx
                });
                break;
            case PermissionTypes.TREE:
                action = action as TreePermissionsActions;
                perm = await treePermissionDomain.getTreePermission({
                    action,
                    treeId: applyTo,
                    userId,
                    ctx
                });
                break;
            case PermissionTypes.TREE_NODE:
                if (!target.nodeId) {
                    throw new ValidationError({
                        target: {msg: Errors.MISSING_FIELDS, vars: {fields: 'nodeId'}}
                    });
                }

                perm = await treeNodePermissionDomain.getTreeNodePermission({
                    action: action as TreeNodePermissionsActions,
                    userId,
                    treeId: applyTo,
                    nodeId: target.nodeId,
                    ctx
                });
                break;
            case PermissionTypes.TREE_LIBRARY:
                const [treeId, libraryId] = applyTo.split('/');

                perm = await treeLibraryPermissionDomain.getTreeLibraryPermission({
                    action: action as TreeNodePermissionsActions,
                    userId,
                    treeId,
                    libraryId,
                    ctx
                });
                break;
            case PermissionTypes.APPLICATION:
                action = action as ApplicationPermissionsActions;
                perm = await applicationPermissionDomain.getApplicationPermission({
                    action,
                    applicationId: applyTo,
                    userId,
                    ctx
                });
                break;
        }

        return perm;
    };

    const getActionsByType = ({
        type,
        applyOn,
        skipApplyOn = false
    }: IGetActionsByTypeParams): ILabeledPermissionsAction[] => {
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
            case PermissionTypes.RECORD_ATTRIBUTE:
                perms = Object.values(RecordAttributePermissionsActions);
                break;
            case PermissionTypes.TREE:
                perms = Object.values(TreePermissionsActions);
            case PermissionTypes.TREE_LIBRARY:
            case PermissionTypes.TREE_NODE:
                perms = Object.values(TreeNodePermissionsActions);
                break;
            case PermissionTypes.APPLICATION:
                perms = Object.values(ApplicationPermissionsActions);
                break;
        }

        // Retrieve plugin permissions, applying filter if applyOn is specified
        const pluginPermissions = (_pluginPermissions[type] ?? [])
            .filter(p => skipApplyOn || !p.applyOn || p.applyOn.indexOf(applyOn) !== -1)
            .map(p => p.name);

        const res: ILabeledPermissionsAction[] = [...perms, ...pluginPermissions].map(p => ({
            name: p,
            label: config.lang.available.reduce(
                // Retrieve label for all available languages
                (acc, l) => ({
                    ...acc,
                    [l]: deps.translator.t(`permissions.${p}`, {lng: l})
                }),
                {}
            )
        }));

        return res;
    };

    const registerActions = (type: PermissionTypes, actions: string[], applyOn?: string[]) => {
        _pluginPermissions[type] = [...(_pluginPermissions[type] ?? []), ...actions.map(a => ({name: a, applyOn}))];
    };

    return {
        savePermission,
        getPermissionsByActions,
        getInheritedPermissions,
        isAllowed,
        getActionsByType,
        registerActions
    };
}
