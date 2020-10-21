import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IConfig} from '_types/config';
import {PermissionTypes} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import getDefaultPermission from './helpers/getDefaultPermission';
import getPermissionByUserGroups from './helpers/getPermissionByUserGroups';
import {IPermissionDomain} from './permissionDomain';
import {IGetAttributePermissionParams, IGetHeritedAttributePermissionParams} from './_types';

export interface IAttributePermissionDomain {
    getAttributePermission(params: IGetAttributePermissionParams): Promise<boolean>;
    getHeritedAttributePermission(params: IGetHeritedAttributePermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission'?: IPermissionDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.value'?: IValueRepo;
    'core.infra.permission'?: IPermissionRepo;
    config?: IConfig;
}

export default function(deps: IDeps = {}): IAttributePermissionDomain {
    const {
        'core.domain.attribute': attributeDomain = null,
        'core.infra.tree': treeRepo = null,
        'core.infra.value': valueRepo = null,
        config = null
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

        const perm = await getPermissionByUserGroups(
            {
                type: PermissionTypes.ATTRIBUTE,
                action,
                userGroupsPaths,
                applyTo: attributeId,
                ctx
            },
            deps
        );

        return perm !== null ? perm : getDefaultPermission(config);
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

        const perm = await getPermissionByUserGroups(
            {
                type: PermissionTypes.ATTRIBUTE,
                action,
                userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
                applyTo: attributeId,
                ctx
            },
            deps
        );

        return perm !== null ? perm : getDefaultPermission(config);
    };

    return {
        getAttributePermission,
        getHeritedAttributePermission
    };
}
