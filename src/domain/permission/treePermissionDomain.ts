import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {ITreeNode} from '_types/tree';
import {
    ITreePermissionsConf,
    PermissionsActions,
    PermissionsRelations,
    PermissionTypes
} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IPermissionDomain} from './permissionDomain';

export interface ITreePermissionDomain {
    getTreePermission(
        type: PermissionTypes,
        action: PermissionsActions,
        userGroupId: number,
        applyTo: string,
        treeValues: {[treeAttributeId: string]: ITreeNode[]},
        permissionsConf: ITreePermissionsConf
    ): Promise<boolean>;
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
                const perm = await _getTreeElemPermission(type, action, applyTo, treeElem, permTreeId, userGroupsPaths);
                if (perm !== null) {
                    return perm;
                }
            }
        }

        // No permission found, return default permission
        return permissionDomain.getDefaultPermission();
    }

    /**
     * Return permission defined for given node on perm tree.
     * Get user's group, then run through its ancestors to look for any permission defined.
     * If nothing defined, return null
     *
     * @param action
     * @param treeElem
     * @param permTreeId
     * @param userGroupsPaths
     */
    async function _getTreeElemPermission(
        type: PermissionTypes,
        action: PermissionsActions,
        applyTo: string,
        treeElem: ITreeNode,
        permTreeId: string,
        userGroupsPaths: ITreeNode[][]
    ) {
        const userPerms = await Promise.all(
            userGroupsPaths.map(async groupPath => {
                for (const group of groupPath.slice().reverse()) {
                    const perm = await permissionDomain.getSimplePermission(type, applyTo, action, group.record.id, {
                        id: treeElem.record.id,
                        library: treeElem.record.library,
                        tree: permTreeId
                    });

                    if (perm !== null) {
                        return perm;
                    }
                }

                return null;
            })
        );

        // If user is allowed at least once among all his groups (whether a defined permission or default config)
        //    => return true
        // Otherwise, if user is forbidden at least once
        //    => return false
        // If no permission defined for all groups
        //    => return null
        const userPerm = userPerms.reduce((globalPerm, groupPerm) => {
            if (globalPerm || groupPerm) {
                return true;
            } else if (globalPerm === groupPerm || (globalPerm === null && !groupPerm)) {
                return groupPerm;
            } else {
                return globalPerm;
            }
        }, null);

        return userPerm;
    }

    return {
        async getTreePermission(
            type: PermissionTypes,
            action: PermissionsActions,
            userGroupId: number,
            applyTo: string,
            treeValues: {[treeAttributeId: string]: ITreeNode[]},
            permissionsConf: ITreePermissionsConf
        ): Promise<boolean> {
            if (!permissionsConf.permissionTreeAttributes.length) {
                return permissionDomain.getDefaultPermission();
            }

            const userGroupAttr = await attributeDomain.getAttributeProperties('user_groups');

            // Get user group, retrieve ancestors
            const userGroups = await valueRepo.getValues('users', userGroupId, userGroupAttr);
            const userGroupsPaths = await Promise.all(
                userGroups.map(userGroupVal =>
                    treeRepo.getElementAncestors('users_groups', {
                        id: userGroupVal.value.record.id,
                        library: 'users_groups'
                    })
                )
            );

            const treePerms = await Promise.all(
                permissionsConf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties(permTreeAttr);
                    return _getPermTreePermission(
                        type,
                        action,
                        applyTo,
                        userGroupsPaths,
                        permTreeAttrProps.linked_tree,
                        treeValues[permTreeAttr]
                    );
                })
            );

            const perm = treePerms.reduce((globalPerm, treePerm) => {
                if (globalPerm === null) {
                    return treePerm;
                }

                return permissionsConf.relation === PermissionsRelations.AND
                    ? globalPerm && treePerm
                    : globalPerm || treePerm;
            }, null);

            return perm;
        }
    };
}
