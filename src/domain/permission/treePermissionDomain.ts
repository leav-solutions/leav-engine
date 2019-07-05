import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {ITreeNode} from '_types/tree';
import {
    IPermissionsTreeTarget,
    ITreePermissionsConf,
    PermissionsActions,
    PermissionsRelations,
    PermissionTypes
} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IPermissionDomain} from './permissionDomain';

export interface ITreePermissionDomain {
    getTreePermission(params: IGetTreePermissionParams): Promise<boolean>;
    getHeritedTreePermission(params: IGetHeritedTreePermissionParams): Promise<boolean>;
}

export interface IGetDefaultPermissionParams {
    action?: any;
    applyTo?: string;
    userId?: number;
    userGroups?: ITreeNode[][];
}

export interface IGetTreePermissionParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userId: number;
    applyTo: string;
    treeValues: {[treeAttributeId: string]: ITreeNode[]};
    permissions_conf: ITreePermissionsConf;
    getDefaultPermission: (params: IGetDefaultPermissionParams) => Promise<boolean> | boolean;
}

export interface IGetHeritedTreePermissionParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userGroupId: number;
    applyTo: string;
    permissionTreeTarget: IPermissionsTreeTarget;
    getDefaultPermission: (params: IGetDefaultPermissionParams) => Promise<boolean> | boolean;
}

export default function(
    permissionDomain: IPermissionDomain,
    treeRepo: ITreeRepo,
    attributeDomain: IAttributeDomain,
    valueRepo: IValueRepo
): ITreePermissionDomain {
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
        permTreeVal: ITreeNode[]
    ): Promise<boolean> {
        if (permTreeVal.length) {
            const permTreePath = await treeRepo.getElementAncestors(permTreeId, {
                id: permTreeVal[0].record.id,
                library: permTreeVal[0].record.library
            });

            for (const treeElem of permTreePath.slice().reverse()) {
                const perm = await permissionDomain.getPermissionByUserGroups(type, action, userGroupsPaths, applyTo, {
                    id: treeElem.record.id,
                    library: treeElem.record.library,
                    tree: permTreeId
                });

                if (perm !== null) {
                    return perm;
                }
            }
        }

        // Nothing found on tree or no value defined, return root level permission
        const rootPerm = await permissionDomain.getPermissionByUserGroups(type, action, userGroupsPaths, applyTo, {
            id: null,
            library: null,
            tree: permTreeId
        });

        return rootPerm;
    }

    return {
        async getTreePermission(params: IGetTreePermissionParams): Promise<boolean> {
            const {type, action, userId, applyTo, treeValues, permissions_conf, getDefaultPermission} = params;

            if (!permissions_conf.permissionTreeAttributes.length) {
                return getDefaultPermission({action, applyTo, userId});
            }

            const userGroupAttr = await attributeDomain.getAttributeProperties('user_groups');

            // Get user group, retrieve ancestors
            const userGroups = await valueRepo.getValues('users', userId, userGroupAttr);
            const userGroupsPaths = await Promise.all(
                userGroups.map(userGroupVal =>
                    treeRepo.getElementAncestors('users_groups', {
                        id: userGroupVal.value.record.id,
                        library: 'users_groups'
                    })
                )
            );

            const treePerms = await Promise.all(
                permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties(permTreeAttr);
                    const treePerm = await _getPermTreePermission(
                        type,
                        action,
                        applyTo,
                        userGroupsPaths,
                        permTreeAttrProps.linked_tree,
                        treeValues[permTreeAttr]
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
        async getHeritedTreePermission(params: IGetHeritedTreePermissionParams): Promise<boolean> {
            const {type, action, userGroupId, applyTo, permissionTreeTarget, getDefaultPermission} = params;

            // Get perm for user group's parent
            const groupAncestors = await treeRepo.getElementAncestors('users_groups', {
                id: userGroupId,
                library: 'users_groups'
            });

            const parentPerm = await permissionDomain.getPermissionByUserGroups(
                type,
                action,
                [groupAncestors.slice(0, -1)], // Start from parent group
                applyTo,
                permissionTreeTarget
            );

            if (parentPerm !== null) {
                return parentPerm;
            }

            const treeElemAncestors = await treeRepo.getElementAncestors(permissionTreeTarget.tree, {
                id: Number(permissionTreeTarget.id),
                library: permissionTreeTarget.library
            });

            // If nothing found, get herited perm via tree
            const perm = await _getPermTreePermission(
                type,
                action,
                applyTo,
                [groupAncestors],
                permissionTreeTarget.tree,
                treeElemAncestors.slice(0, -1)
            );

            if (perm !== null) {
                return perm;
            }

            // Nothing found? Return library permission
            const libPerm = await permissionDomain.getPermissionByUserGroups(
                PermissionTypes.LIBRARY,
                action,
                [groupAncestors],
                applyTo
            );

            return libPerm !== null ? libPerm : permissionDomain.getDefaultPermission();
        }
    };
}
