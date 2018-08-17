import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {AdminPermisisonsActions, PermissionTypes} from '../../_types/permissions';
import {IPermissionDomain} from './permissionDomain';

export interface IAdminPermissionDomain {
    getAdminPermission(action: AdminPermisisonsActions, userGroupId: number): Promise<boolean>;
}

export default function(
    permissionDomain: IPermissionDomain,
    attributeRepo: IAttributeRepo,
    valueRepo: IValueRepo,
    treeRepo: ITreeRepo
): IAdminPermissionDomain {
    return {
        async getAdminPermission(action: AdminPermisisonsActions, userGroupId: number): Promise<boolean> {
            const userGroupAttr = await attributeRepo.getAttributes({id: 'user_groups'});

            // Get user group, retrieve ancestors
            const userGroups = await valueRepo.getValues('users', userGroupId, userGroupAttr[0]);
            const userGroupsPaths = await Promise.all(
                userGroups.map(userGroupVal =>
                    treeRepo.getElementAncestors('users_groups', {
                        id: userGroupVal.value.record.id,
                        library: 'users_groups'
                    })
                )
            );

            const perm = await permissionDomain.getPermissionByUserGroups(
                PermissionTypes.ADMIN,
                action,
                userGroupsPaths
            );

            return perm !== null ? perm : permissionDomain.getDefaultPermission();
        }
    };
}
