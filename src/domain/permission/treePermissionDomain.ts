import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {PermissionTypes} from '../../_types/permissions';
import {IDefaultPermissionHelper} from './helpers/defaultPermission';
import {IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {IGetHeritedTreePermissionParams, IGetTreePermissionParams} from './_types';

export interface ITreePermissionDomain {
    getTreePermission(params: IGetTreePermissionParams): Promise<boolean>;
    getHeritedTreePermission(params: IGetHeritedTreePermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.permissionByUserGroups'?: IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission'?: IDefaultPermissionHelper;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.value'?: IValueRepo;
    'core.infra.tree'?: ITreeRepo;
}

export default function(deps: IDeps = {}): ITreePermissionDomain {
    const {
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper = null,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper = null,
        'core.infra.attribute': attributeRepo = null,
        'core.infra.value': valueRepo = null,
        'core.infra.tree': treeRepo = null
    } = deps;

    const getTreePermission = async ({action, treeId, userId, ctx}: IGetTreePermissionParams): Promise<boolean> => {
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

        const perm = await permByUserGroupsHelper.getPermissionByUserGroups({
            type: PermissionTypes.TREE,
            action,
            userGroupsPaths,
            applyTo: treeId,
            ctx
        });

        return perm !== null ? perm : defaultPermHelper.getDefaultPermission();
    };

    const getHeritedTreePermission = async ({
        action,
        treeId,
        userGroupId,
        ctx
    }: IGetHeritedTreePermissionParams): Promise<boolean> => {
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
            type: PermissionTypes.TREE,
            action,
            userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
            applyTo: treeId,
            ctx
        });

        return perm !== null ? perm : defaultPermHelper.getDefaultPermission();
    };

    return {
        getTreePermission,
        getHeritedTreePermission
    };
}
