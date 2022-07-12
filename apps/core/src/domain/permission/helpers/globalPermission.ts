// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {ECacheType, ICachesService} from '../../../infra/cache/cacheService';
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
    getDefaultPermission?: (params?: IGetDefaultGlobalPermissionParams) => boolean;
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
interface IDeps {
    'core.domain.permission.helpers.permissionByUserGroups'?: IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission'?: IDefaultPermissionHelper;
    'core.infra.permission'?: IPermissionRepo;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.value'?: IValueRepo;
    'core.infra.cache.cacheService'?: ICachesService;
}

export default function ({
    'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper = null,
    'core.domain.permission.helpers.defaultPermission': defaultPermHelper = null,
    'core.infra.attribute': attributeRepo = null,
    'core.infra.value': valueRepo = null,
    'core.infra.tree': treeRepo = null,
    'core.infra.cache.cacheService': cacheService = null
}: IDeps): IGlobalPermissionHelper {
    return {
        async getGlobalPermission(
            {type, applyTo, userId, action, getDefaultPermission = defaultPermHelper.getDefaultPermission},
            ctx
        ): Promise<boolean> {
            const cacheKey = getPermissionCacheKey(ctx.groupsId, type, applyTo, action, '');
            const permFromCache = (await cacheService.getCache(ECacheType.RAM).getData([cacheKey]))[0];
            let perm: boolean;

            if (permFromCache !== null) {
                if (permFromCache === PERMISSIONS_NULL_PLACEHOLDER) {
                    perm = null;
                } else {
                    perm = permFromCache === 'true';
                }
            } else {
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

                perm = await permByUserGroupsHelper.getPermissionByUserGroups({
                    type,
                    action,
                    userGroupsPaths,
                    applyTo,
                    ctx
                });

                const permToStore = perm === null ? PERMISSIONS_NULL_PLACEHOLDER : perm.toString();
                await cacheService.getCache(ECacheType.RAM).storeData(cacheKey, permToStore);
            }

            return perm ?? getDefaultPermission({action, applyTo, type, userId, ctx});
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

            const perm = await permByUserGroupsHelper.getPermissionByUserGroups({
                type,
                action,
                userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
                applyTo,
                ctx
            });

            return perm !== null ? perm : getDefaultPermission();
        }
    };
}
