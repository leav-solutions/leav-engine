import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeNode} from '_types/tree';
import {
    IPermissionsTreeTarget,
    ITreePermissionsConf,
    PermissionsActions,
    PermissionsRelations,
    PermissionTypes
} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import getGlobalDefaultPermission from './helpers/getDefaultPermission';
import getPermissionByUserGroups from './helpers/getPermissionByUserGroups';
import {IPermissionDomain} from './permissionDomain';

export interface ITreePermissionDomain {
    getTreePermission(params: IGetTreePermissionParams, ctx: IQueryInfos): Promise<boolean>;
    getHeritedTreePermission(params: IGetHeritedTreePermissionParams, ctx: IQueryInfos): Promise<boolean>;
}

export interface IGetDefaultPermissionParams {
    action?: any;
    applyTo?: string;
    userId?: string;
    userGroups?: ITreeNode[][];
}

export interface IGetTreePermissionParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userId: string;
    applyTo: string;
    treeValues: {[treeAttributeId: string]: ITreeNode[]};
    permissions_conf: ITreePermissionsConf;
    getDefaultPermission: (params: IGetDefaultPermissionParams) => Promise<boolean> | boolean;
}

export interface IGetHeritedTreePermissionParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userGroupId: string;
    applyTo: string;
    permissionTreeTarget: IPermissionsTreeTarget;
    getDefaultPermission: (params: IGetDefaultPermissionParams) => Promise<boolean> | boolean;
}

interface IDeps {
    'core.domain.permission'?: IPermissionDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.value'?: IValueRepo;
    'core.infra.permission'?: IPermissionRepo;
    config?: IConfig;
}

export default function(deps: IDeps = {}): ITreePermissionDomain {
    const {
        'core.domain.attribute': attributeDomain = null,
        'core.infra.tree': treeRepo = null,
        'core.infra.value': valueRepo = null,
        config = null
    } = deps;
    /**
     * Return permission for given permission tree attribute.
     * Get record's value on this tree attribute, then run through its ancestors to look for any permission defined
     *
     * @param action
     * @param recordLibrary
     * @param recordId
     * @param permTreeAttr
     * @param userGroupsPaths
     */
    async function _getPermTreePermission(
        type: PermissionTypes,
        action: PermissionsActions,
        applyTo: string,
        userGroupsPaths: ITreeNode[][],
        permTreeId: string,
        permTreeVal: ITreeNode[],
        ctx: IQueryInfos
    ): Promise<boolean> {
        if (permTreeVal.length) {
            const permTreePath = await treeRepo.getElementAncestors({
                treeId: permTreeId,
                element: {
                    id: permTreeVal[0].record.id,
                    library: permTreeVal[0].record.library
                },
                ctx
            });

            for (const treeElem of permTreePath.slice().reverse()) {
                const perm = await getPermissionByUserGroups(
                    {
                        type,
                        action,
                        userGroupsPaths,
                        applyTo,
                        permissionTreeTarget: {
                            id: treeElem.record.id,
                            library: treeElem.record.library,
                            tree: permTreeId
                        },
                        ctx
                    },

                    deps
                );

                if (perm !== null) {
                    return perm;
                }
            }
        }

        // Nothing found on tree or no value defined, return root level permission
        const rootPerm = await getPermissionByUserGroups(
            {
                type,
                action,
                userGroupsPaths,
                applyTo,
                permissionTreeTarget: {
                    id: null,
                    library: null,
                    tree: permTreeId
                },
                ctx
            },

            deps
        );

        return rootPerm;
    }

    return {
        async getTreePermission(params: IGetTreePermissionParams, ctx: IQueryInfos): Promise<boolean> {
            const {type, action, userId, applyTo, treeValues, permissions_conf, getDefaultPermission} = params;

            if (!permissions_conf.permissionTreeAttributes.length) {
                return getDefaultPermission({action, applyTo, userId});
            }

            const userGroupAttr = await attributeDomain.getAttributeProperties({id: 'user_groups', ctx});

            // Get user group, retrieve ancestors
            const userGroups = await valueRepo.getValues({
                library: 'users',
                recordId: userId,
                attribute: userGroupAttr,
                ctx
            });
            const userGroupsPaths = await Promise.all(
                userGroups.map(userGroupVal =>
                    treeRepo.getElementAncestors({
                        treeId: 'users_groups',
                        element: {
                            id: userGroupVal.value.record.id,
                            library: 'users_groups'
                        },
                        ctx
                    })
                )
            );

            const treePerms = await Promise.all(
                permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                    const treePerm = await _getPermTreePermission(
                        type,
                        action,
                        applyTo,
                        userGroupsPaths,
                        permTreeAttrProps.linked_tree,
                        treeValues[permTreeAttr],
                        ctx
                    );

                    if (treePerm !== null) {
                        return treePerm;
                    }

                    return getDefaultPermission({action, applyTo, userId});
                })
            );

            const perm = treePerms.reduce((globalPerm, treePerm) => {
                if (globalPerm === null) {
                    return treePerm;
                }

                return permissions_conf.relation === PermissionsRelations.AND
                    ? globalPerm && treePerm
                    : globalPerm || treePerm;
            }, null);

            return perm;
        },
        async getHeritedTreePermission(params: IGetHeritedTreePermissionParams, ctx: IQueryInfos): Promise<boolean> {
            const {type, action, userGroupId, applyTo, permissionTreeTarget, getDefaultPermission} = params;

            // Get perm for user group's parent
            const groupAncestors = await treeRepo.getElementAncestors({
                treeId: 'users_groups',
                element: {
                    id: userGroupId,
                    library: 'users_groups'
                },
                ctx
            });

            const parentPerm = await getPermissionByUserGroups(
                {
                    type,
                    action,
                    userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
                    applyTo,
                    permissionTreeTarget,
                    ctx
                },

                deps
            );

            if (parentPerm !== null) {
                return parentPerm;
            }

            const treeElemAncestors = await treeRepo.getElementAncestors({
                treeId: permissionTreeTarget.tree,
                element: {
                    id: permissionTreeTarget.id,
                    library: permissionTreeTarget.library
                },
                ctx
            });

            // If nothing found, get herited perm via tree
            const perm = await _getPermTreePermission(
                type,
                action,
                applyTo,
                [groupAncestors],
                permissionTreeTarget.tree,
                treeElemAncestors.slice(0, -1),
                ctx
            );

            if (perm !== null) {
                return perm;
            }

            // Nothing found? Return library permission
            const libPerm = await getDefaultPermission({
                action,
                applyTo,
                userGroups: [groupAncestors]
            });

            return libPerm !== null ? libPerm : getGlobalDefaultPermission(config);
        }
    };
}
