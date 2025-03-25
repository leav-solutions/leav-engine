// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IGetPermissionByUserGroupsParams} from '../_types';
import {IReducePermissionsArrayHelper} from './reducePermissionsArray';
import {ISimplePermissionHelper} from './simplePermission';
import {IDefaultPermissionHelper} from './defaultPermission';
import {IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {ITreeNode} from '../../../_types/tree';

export interface IPermissionByUserGroupsHelperDeps {
    'core.domain.permission.helpers.simplePermission': ISimplePermissionHelper;
    'core.domain.permission.helpers.reducePermissionsArray': IReducePermissionsArrayHelper;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.infra.permission'?: IPermissionRepo;
}

export interface IPermissionByUserGroupsHelper {
    getPermissionByUserGroups: (params: IGetPermissionByUserGroupsParams) => Promise<boolean>;
}

export default function (deps: IPermissionByUserGroupsHelperDeps): IPermissionByUserGroupsHelper {
    const {
        'core.domain.permission.helpers.simplePermission': simplePermHelper,
        'core.domain.permission.helpers.reducePermissionsArray': reducePermissionsArrayHelper,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
        'core.domain.tree.helpers.elementAncestors': elementAncestorsHelper
    } = deps;

    return {
        async getPermissionByUserGroups({
            type,
            action,
            userGroupsPaths,
            applyTo = null,
            permissionTreeTarget = null,
            getDefaultPermission = defaultPermHelper.getDefaultPermission,
            ctx
        }: IGetPermissionByUserGroupsParams): Promise<boolean> {
            let permTreePath: ITreeNode[] = null;
            if (permissionTreeTarget) {
                permTreePath = (
                    await elementAncestorsHelper.getCachedElementAncestors({
                        treeId: permissionTreeTarget.tree,
                        nodeId: permissionTreeTarget.nodeId,
                        ctx
                    })
                ).reverse();
            }

            // we reverse to have group paths from current user groups to the added root group
            userGroupsPaths = userGroupsPaths.length
                ? userGroupsPaths.map(path => [...path.reverse(), {id: null}])
                : [[{id: null}]];

            const getPermission = async (
                userGroupPath: ITreeNode[],
                treeTargetPath: ITreeNode[] | null
            ): Promise<boolean> => {
                for (const groupNode of userGroupPath) {
                    const groupNodePermission = await simplePermHelper.getSimplePermission({
                        type,
                        applyTo,
                        action,
                        usersGroupNodeId: groupNode.id,
                        ...(!!treeTargetPath && {
                            permissionTreeTarget: {
                                tree: permissionTreeTarget.tree,
                                nodeId: treeTargetPath[0]?.id ?? null
                            }
                        }),
                        ctx
                    });

                    if (groupNodePermission !== null) {
                        return groupNodePermission;
                    }
                }

                if (treeTargetPath?.length) {
                    return getPermission(userGroupPath, treeTargetPath.slice(1));
                }

                return getDefaultPermission();
            };

            const userPerms = await Promise.all(
                userGroupsPaths.map(userGroupPath => getPermission(userGroupPath, permTreePath))
            );

            // The user may have multiple groups with different permissions. We must reduce them to a single permission
            return reducePermissionsArrayHelper.reducePermissionsArray(userPerms);
        }
    };
}
