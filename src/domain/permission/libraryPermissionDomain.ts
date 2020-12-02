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
import {IGetHeritedLibraryPermissionParams, IGetLibraryPermissionParams} from './_types';

export interface ILibraryPermissionDomain {
    getLibraryPermission({action, userId, ctx}: IGetLibraryPermissionParams): Promise<boolean>;
    getHeritedLibraryPermission({action, userGroupId, ctx}: IGetHeritedLibraryPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.infra.permission'?: IPermissionRepo;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.value'?: IValueRepo;
    config?: any;
}

export default function(deps: IDeps = {}): ILibraryPermissionDomain {
    const {
        'core.infra.attribute': attributeRepo = null,
        'core.infra.value': valueRepo = null,
        'core.infra.tree': treeRepo = null,
        config = null
    } = deps;

    const getLibraryPermission = async ({
        action,
        libraryId,
        userId,
        ctx
    }: IGetLibraryPermissionParams): Promise<boolean> => {
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
                type: PermissionTypes.LIBRARY,
                action,
                userGroupsPaths,
                applyTo: libraryId,
                ctx
            },
            deps
        );

        return perm !== null ? perm : getDefaultPermission(config);
    };

    const getHeritedLibraryPermission = async ({
        action,
        libraryId,
        userGroupId,
        ctx
    }: IGetHeritedLibraryPermissionParams): Promise<boolean> => {
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
                type: PermissionTypes.LIBRARY,
                action,
                userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
                applyTo: libraryId,
                ctx
            },
            deps
        );

        return perm !== null ? perm : getDefaultPermission(config);
    };

    return {
        getLibraryPermission,
        getHeritedLibraryPermission
    };
}
