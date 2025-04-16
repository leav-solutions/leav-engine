// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {ICachesService} from '../../../infra/cache/cacheService';
import {PermissionsActions, PermissionTypes} from '../../../_types/permissions';
import {PERMISSIONS_NULL_PLACEHOLDER} from '../_types';
import {IDefaultPermissionHelper} from './defaultPermission';
import getPermissionCacheKey from './getPermissionCacheKey';
import {IPermissionByUserGroupsHelper} from './permissionByUserGroups';

interface IGetGlobalPermissionParams {
    type: PermissionTypes;
    applyTo?: string;
    userId: string;
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
    'core.infra.permission': IPermissionRepo;
    'core.infra.attribute': IAttributeRepo;
    'core.infra.tree': ITreeRepo;
    'core.infra.value': IValueRepo;
    'core.infra.cache.cacheService': ICachesService;
}

export default function ({
    'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper,
    'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
    'core.infra.attribute': attributeRepo,
    'core.infra.value': valueRepo,
    'core.infra.tree': treeRepo,
    'core.infra.cache.cacheService': cacheService
}: IGlobalPermissionDeps): IGlobalPermissionHelper {
    return {
        async getGlobalPermission(
            {type, applyTo, userId, action, getDefaultPermission = defaultPermHelper.getDefaultPermission},
            ctx
        ): Promise<boolean> {
            // disable cache temporary: const cacheKey = getPermissionCacheKey(ctx.groupsId ?? null, type, applyTo, action, '');
            // disable cache temporary: const permFromCache = (await cacheService.getCache(ECacheType.RAM).getData([cacheKey]))[0];
            // disable cache temporary: let perm: boolean;

            /* disable cache temporary: if (permFromCache !== null) {
                perm = permFromCache === 'true';
            } else {*/
            const userGroupsPaths = !!ctx.groupsId
                ? await Promise.all(
                      ctx.groupsId.map(async groupId =>
                          treeRepo.getElementAncestors({
                              treeId: 'users_groups',
                              nodeId: groupId,
                              ctx
                          })
                      )
                  )
                : [];

            const perm = await permByUserGroupsHelper.getPermissionByUserGroups({
                type,
                action,
                userGroupsPaths,
                applyTo,
                getDefaultPermission,
                ctx
            });

            // disable cache temporary: await cacheService.getCache(ECacheType.RAM).storeData({key: cacheKey, data: perm.toString()});
            // }

            return perm;
        },
        async getInheritedGlobalPermission(
            {type, applyTo, userGroupNodeId, action, getDefaultPermission = defaultPermHelper.getDefaultPermission},
            ctx
        ): Promise<boolean> {
            // Get perm for user group's parent
            const groupAncestors = await treeRepo.getElementAncestors({
                treeId: 'users_groups',
                nodeId: userGroupNodeId,
                ctx
            });

            return permByUserGroupsHelper.getPermissionByUserGroups({
                type,
                action,
                userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
                applyTo,
                getDefaultPermission,
                ctx
            });
        }
    };
}
