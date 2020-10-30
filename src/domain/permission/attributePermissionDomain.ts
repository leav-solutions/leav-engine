// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {PermissionTypes} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IDefaultPermissionHelper} from './helpers/defaultPermission';
import {IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {IGetAttributePermissionParams, IGetHeritedAttributePermissionParams} from './_types';

export interface IAttributePermissionDomain {
    getAttributePermission(params: IGetAttributePermissionParams): Promise<boolean>;
    getHeritedAttributePermission(params: IGetHeritedAttributePermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.permissionByUserGroups'?: IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission'?: IDefaultPermissionHelper;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.value'?: IValueRepo;
}

export default function(deps: IDeps = {}): IAttributePermissionDomain {
    const {
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper = null,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper = null,
        'core.domain.attribute': attributeDomain = null,
        'core.infra.tree': treeRepo = null,
        'core.infra.value': valueRepo = null
    } = deps;

    const getAttributePermission = async ({
        action,
        attributeId,
        ctx
    }: IGetAttributePermissionParams): Promise<boolean> => {
        const userGroupAttr = await attributeDomain.getAttributeProperties({id: 'user_groups', ctx});

        // Get user group, retrieve ancestors
        const userGroups = await valueRepo.getValues({
            library: 'users',
            recordId: ctx.userId,
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

        const perm = await permByUserGroupsHelper.getPermissionByUserGroups({
            type: PermissionTypes.ATTRIBUTE,
            action,
            userGroupsPaths,
            applyTo: attributeId,
            ctx
        });

        return perm !== null ? perm : defaultPermHelper.getDefaultPermission();
    };

    const getHeritedAttributePermission = async ({
        action,
        attributeId,
        userGroupId,
        ctx
    }: IGetHeritedAttributePermissionParams): Promise<boolean> => {
        // Get perm for user group's parent
        const groupAncestors = await treeRepo.getElementAncestors({
            treeId: 'users_groups',
            element: {
                id: userGroupId,
                library: 'users_groups'
            },
            ctx
        });

        const perm = await permByUserGroupsHelper.getPermissionByUserGroups({
            type: PermissionTypes.ATTRIBUTE,
            action,
            userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
            applyTo: attributeId,
            ctx
        });

        return perm !== null ? perm : defaultPermHelper.getDefaultPermission();
    };

    return {
        getAttributePermission,
        getHeritedAttributePermission
    };
}
