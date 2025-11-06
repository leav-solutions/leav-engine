// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IQueryInfos} from '_types/queryInfos';
import {type PermissionsActions, type PermissionTypes} from '../../../_types/permissions';
import {type IDefaultPermissionHelper} from './defaultPermission';
import {type IPermissionByUserGroupsHelper} from './permissionByUserGroups';
import {type IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';

interface IGetGlobalPermissionParams {
    type: PermissionTypes;
    applyTo?: string;
    action: PermissionsActions;
    getDefaultPermission?: (params?: IGetDefaultGlobalPermissionParams) => Promise<boolean> | boolean;
}

interface IGetInheritedGlobalPermissionParams {
    type: PermissionTypes;
    applyTo?: string;
    userGroupNodeId: string | null;
    action: PermissionsActions;
    getDefaultPermission?: (params?: IGetDefaultGlobalPermissionParams) => boolean;
}

interface IGetDefaultGlobalPermissionParams {
    type?: PermissionTypes;
    applyTo?: string;
    userId?: string;
    action?: PermissionsActions;
    ctx: IQueryInfos;
}

export interface IGlobalPermissionHelper {
    getGlobalPermission(params: IGetGlobalPermissionParams, ctx: IQueryInfos): Promise<boolean>;
    getInheritedGlobalPermission(params: IGetInheritedGlobalPermissionParams, ctx: IQueryInfos): Promise<boolean>;
}
export interface IGlobalPermissionDeps {
    'core.domain.permission.helpers.permissionByUserGroups': IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
}

export default function ({
    'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper,
    'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
    'core.domain.tree.helpers.elementAncestors': elementAncestorsHelper,
}: IGlobalPermissionDeps): IGlobalPermissionHelper {
    return {
        async getGlobalPermission(
            {type, applyTo, action, getDefaultPermission = defaultPermHelper.getDefaultPermission},
            ctx,
        ): Promise<boolean> {
            const userGroupsPaths = !!ctx.groupsId
                ? await Promise.all(
                      ctx.groupsId.map(async groupId =>
                          elementAncestorsHelper.getCachedElementAncestors({
                              treeId: 'users_groups',
                              nodeId: groupId,
                              ctx,
                          }),
                      ),
                  )
                : [];

            return permByUserGroupsHelper.getPermissionByUserGroups({
                type,
                action,
                userGroupsPaths,
                applyTo,
                getDefaultPermission,
                ctx,
            });
        },
        async getInheritedGlobalPermission(
            {type, applyTo, userGroupNodeId, action, getDefaultPermission = defaultPermHelper.getDefaultPermission},
            ctx,
        ): Promise<boolean> {
            // Get perm for user group's parent
            const groupAncestors = await elementAncestorsHelper.getCachedElementAncestors({
                treeId: 'users_groups',
                nodeId: userGroupNodeId,
                ctx,
            });

            return permByUserGroupsHelper.getPermissionByUserGroups({
                type,
                action,
                userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
                applyTo,
                getDefaultPermission,
                ctx,
            });
        },
    };
}
