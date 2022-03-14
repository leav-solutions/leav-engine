// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeValue} from '_types/value';
import {PermissionsActions, PermissionTypes} from '../../../_types/permissions';
import {IDefaultPermissionHelper} from './defaultPermission';
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
}

export default function ({
    'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper = null,
    'core.domain.permission.helpers.defaultPermission': defaultPermHelper = null,
    'core.infra.attribute': attributeRepo = null,
    'core.infra.value': valueRepo = null,
    'core.infra.tree': treeRepo = null
}: IDeps): IGlobalPermissionHelper {
    return {
        async getGlobalPermission(
            {type, applyTo, userId, action, getDefaultPermission = defaultPermHelper.getDefaultPermission},
            ctx
        ): Promise<boolean> {
            const userGroupAttr = await attributeRepo.getAttributes({
                params: {
                    filters: {id: 'user_groups'},
                    strictFilters: true
                },
                ctx
            });

            // Get user group, retrieve ancestors
            const userGroups = (await valueRepo.getValues({
                library: 'users',
                recordId: userId,
                attribute: {...userGroupAttr.list[0], reverse_link: undefined},
                ctx
            })) as ITreeValue[];

            const userGroupsPaths = await Promise.all(
                userGroups.map(async userGroupVal => {
                    const groupNodeId = await treeRepo.getNodesByRecord({
                        treeId: userGroupVal.treeId,
                        record: {id: userGroupVal.value.record.id, library: userGroupVal.value.record.library},
                        ctx
                    });
                    return treeRepo.getElementAncestors({
                        treeId: 'users_groups',
                        nodeId: groupNodeId[0],
                        ctx
                    });
                })
            );

            const perm = await permByUserGroupsHelper.getPermissionByUserGroups({
                type,
                action,
                userGroupsPaths,
                applyTo,
                ctx
            });

            return perm !== null ? perm : getDefaultPermission({action, applyTo, type, userId, ctx});
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
