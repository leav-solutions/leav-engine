import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {ITreeNode} from '../../_types/tree';
import {PermissionsRelations, PermissionTypes} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IPermissionDomain} from './permissionDomain';

export interface IRecordPermissionDomain {
    getRecordPermission(action: string, userId: number, recordLibrary: string, recordId: number): Promise<boolean>;
}

export default function(
    permissionDomain: IPermissionDomain,
    libraryDomain: ILibraryDomain,
    treeRepo: ITreeRepo,
    attributeDomain: IAttributeDomain,
    valueRepo: IValueRepo
): IRecordPermissionDomain {
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
        action: string,
        recordLibrary: string,
        recordId: number,
        permTreeAttr: string,
        userGroupsPaths: ITreeNode[][]
    ): Promise<boolean> {
        const permTreeAttrProps = await attributeDomain.getAttributeProperties(permTreeAttr);
        const permTreeVal = await valueRepo.getValues(recordLibrary, recordId, permTreeAttrProps);
        const permTreeId = permTreeAttrProps.linked_tree;

        if (permTreeVal.length) {
            const permTreePath = await treeRepo.getElementAncestors(permTreeId, {
                id: permTreeVal[0].value.record.id,
                library: permTreeVal[0].value.record.library
            });

            for (const treeElem of permTreePath.slice().reverse()) {
                const perm = await _getTreeElemPermission(action, recordLibrary, treeElem, permTreeId, userGroupsPaths);
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
        action: string,
        applyTo: string,
        treeElem: ITreeNode,
        permTreeId: string,
        userGroupsPaths: ITreeNode[][]
    ) {
        const userPerms = await Promise.all(
            userGroupsPaths.map(async groupPath => {
                for (const group of groupPath.slice().reverse()) {
                    const perm = await permissionDomain.getSimplePermission(
                        PermissionTypes.RECORD,
                        applyTo,
                        action,
                        group.record.id,
                        {
                            id: treeElem.record.id,
                            library: treeElem.record.library,
                            tree: permTreeId
                        }
                    );

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
        async getRecordPermission(
            action: string,
            userId: number,
            recordLibrary: string,
            recordId: number
        ): Promise<boolean> {
            // Get tree attributes used by this library for permissions
            const lib = await libraryDomain.getLibraryProperties(recordLibrary);
            const userGroupAttr = await attributeDomain.getAttributeProperties('user_groups');

            if (typeof lib.permissionsConf === 'undefined') {
                return permissionDomain.getDefaultPermission();
            }

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
                lib.permissionsConf.permissionTreeAttributes.map(permTreeAttr =>
                    _getPermTreePermission(action, recordLibrary, recordId, permTreeAttr, userGroupsPaths)
                )
            );

            const perm = treePerms.reduce((globalPerm, treePerm) => {
                if (globalPerm === null) {
                    return treePerm;
                }

                return lib.permissionsConf.relation === PermissionsRelations.AND
                    ? globalPerm && treePerm
                    : globalPerm || treePerm;
            }, null);

            return perm;
        }
    };
}
