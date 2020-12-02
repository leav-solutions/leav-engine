// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {PermissionTypes} from '../../_types/permissions';
import getDefaultPermission from './helpers/getDefaultPermission';
import getPermissionByUserGroups from './helpers/getPermissionByUserGroups';
import {IGetAppPermissionParams, IGetHeritedAppPermissionParams} from './_types';

export interface IAppPermissionDomain {
    getAppPermission({action, userId, ctx}: IGetAppPermissionParams): Promise<boolean>;
    getHeritedAppPermission({action, userGroupId, ctx}: IGetHeritedAppPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.infra.permission'?: IPermissionRepo;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.value'?: IValueRepo;
    config?: any;
}

export default function(deps: IDeps = {}): IAppPermissionDomain {
    const {
        'core.infra.attribute': attributeRepo = null,
        'core.infra.value': valueRepo = null,
        'core.infra.tree': treeRepo = null,
        config = null
    } = deps;

    const getAppPermission = async ({action, userId, ctx}: IGetAppPermissionParams): Promise<boolean> => {
        const userGroupAttr = await attributeRepo.getAttributes({
            params: {
                filters: {id: 'user_groups'},
                strictFilters: true
            },
            ctx
        });

        // Get user group, retrieve ancestors
        const userGroups = await valueRepo.getValues({
            library: 'users',
            recordId: userId,
            attribute: userGroupAttr.list[0],
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

        const perm = await getPermissionByUserGroups(
            {
                type: PermissionTypes.APP,
                action,
                userGroupsPaths,
                ctx
            },
            deps
        );

        return perm !== null ? perm : getDefaultPermission(config);
    };

    const getHeritedAppPermission = async ({
        action,
        userGroupId,
        ctx
    }: IGetHeritedAppPermissionParams): Promise<boolean> => {
        // Get perm for user group's parent
        const groupAncestors = await treeRepo.getElementAncestors({
            treeId: 'users_groups',
            element: {
                id: userGroupId,
                library: 'users_groups'
            },
            ctx
        });

        const perm = await getPermissionByUserGroups(
            {
                type: PermissionTypes.APP,
                action,
                userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
                ctx
            },
            deps
        );

        return perm !== null ? perm : getDefaultPermission(config);
    };

    return {
        getAppPermission,
        getHeritedAppPermission
    };
}
