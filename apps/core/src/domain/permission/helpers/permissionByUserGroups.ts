// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IReducePermissionsArrayHelper} from './reducePermissionsArray';
import {ISimplePermissionHelper} from './simplePermission';
import {IDefaultPermissionHelper} from './defaultPermission';
import {IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {ITreeNode, TreePaths} from '../../../_types/tree';
import {PermissionsActions, PermissionTypes} from '../../../_types/permissions';
import {IQueryInfos} from '../../../_types/queryInfos';

export interface IPermissionByUserGroupsHelperDeps {
    'core.domain.permission.helpers.simplePermission': ISimplePermissionHelper;
    'core.domain.permission.helpers.reducePermissionsArray': IReducePermissionsArrayHelper;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.infra.permission'?: IPermissionRepo;
}

interface IGetPermissionByUserGroupsParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userGroupsPaths: TreePaths[]; // from the most general to the most specific (no root required)
    applyTo?: string;
    treeTarget?: {tree: string; path: ITreeNode[]}; // from the most general to the most specific (add root if needed)
    getDefaultPermission?: () => Promise<boolean> | boolean;
    ctx: IQueryInfos;
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
            treeTarget = null,
            getDefaultPermission = defaultPermHelper.getDefaultPermission,
            ctx
        }: IGetPermissionByUserGroupsParams): Promise<boolean> {
            // we reverse to have group paths from current user groups to the added root group
            const reversedGroupsPath = userGroupsPaths.length
                ? userGroupsPaths.map(path => [...path.reverse(), {id: null}])
                : [[{id: null}]];

            // we reverse to have tree target path from current target
            let reversedTreeTargetPath: ITreeNode[];
            if (treeTarget) {
                reversedTreeTargetPath = [...treeTarget.path].reverse();
            }

            const getPermission = async (groupPath: ITreeNode[], targetPath?: ITreeNode[]): Promise<boolean> => {
                for (const group of groupPath) {
                    const groupPermission = await simplePermHelper.getSimplePermission({
                        type,
                        applyTo,
                        action,
                        usersGroupNodeId: group.id,
                        ...(!!targetPath && {
                            permissionTreeTarget: {
                                tree: treeTarget.tree,
                                nodeId: targetPath[0].id
                            }
                        }),
                        ctx
                    });

                    if (groupPermission !== null) {
                        return groupPermission;
                    }
                }

                const newTargetPath = targetPath?.slice(1);

                if (newTargetPath?.length) {
                    return getPermission(groupPath, newTargetPath);
                }

                return getDefaultPermission();
            };

            const userPerms = await Promise.all(
                reversedGroupsPath.map(groupPath => getPermission(groupPath, reversedTreeTargetPath))
            );

            // The user may have multiple groups with different permissions. We must reduce them to a single permission
            return reducePermissionsArrayHelper.reducePermissionsArray(userPerms);
        }
    };
}
