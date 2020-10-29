import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {PermissionsRelations} from '../../../_types/permissions';
import {IGetHeritedTreeBasedPermissionParams, IGetTreeBasedPermissionParams} from '../_types';
import getGlobalDefaultPermission from './getDefaultPermission';
import getPermissionByUserGroups from './getPermissionByUserGroups';
import getPermTreePermission from './getPermTreePermission';

interface IDeps {
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.permission'?: IPermissionRepo;
    'core.infra.value'?: IValueRepo;
    config?: IConfig;
}

export interface ITreeBasedPermissionHelper {
    getTreeBasedPermission(params: IGetTreeBasedPermissionParams, ctx: IQueryInfos): Promise<boolean>;
    getHeritedTreeBasedPermission(params: IGetHeritedTreeBasedPermissionParams, ctx: IQueryInfos): Promise<boolean>;
}

export default function(deps: IDeps): ITreeBasedPermissionHelper {
    const {
        'core.domain.attribute': attributeDomain = null,
        'core.infra.tree': treeRepo = null,
        'core.infra.value': valueRepo = null,
        config = null
    } = deps;

    const getTreeBasedPermission = async (
        params: IGetTreeBasedPermissionParams,
        ctx: IQueryInfos
    ): Promise<boolean> => {
        const {type, action, userId, applyTo, treeValues, permissions_conf, getDefaultPermission} = params;

        if (!permissions_conf.permissionTreeAttributes.length) {
            return getDefaultPermission({action, applyTo, userId});
        }

        const userGroupAttr = await attributeDomain.getAttributeProperties({id: 'user_groups', ctx});

        // Get user group, retrieve ancestors
        const userGroups = await valueRepo.getValues({
            library: 'users',
            recordId: userId,
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

        const treePerms = await Promise.all(
            permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                const treePerm = await getPermTreePermission(
                    {
                        type,
                        action,
                        applyTo,
                        userGroupsPaths,
                        permTreeId: permTreeAttrProps.linked_tree,
                        permTreeVal: treeValues[permTreeAttr],
                        ctx
                    },
                    deps
                );

                if (treePerm !== null) {
                    return treePerm;
                }

                return getDefaultPermission({action, applyTo, userId});
            })
        );

        const perm = treePerms.reduce((globalPerm, treePerm) => {
            if (globalPerm === null) {
                return treePerm;
            }

            return permissions_conf.relation === PermissionsRelations.AND
                ? globalPerm && treePerm
                : globalPerm || treePerm;
        }, null);

        return perm;
    };

    const getHeritedTreeBasedPermission = async (
        params: IGetHeritedTreeBasedPermissionParams,
        ctx: IQueryInfos
    ): Promise<boolean> => {
        const {type, action, userGroupId, applyTo, permissionTreeTarget, getDefaultPermission} = params;

        // Get perm for user group's parent
        const groupAncestors = await treeRepo.getElementAncestors({
            treeId: 'users_groups',
            element: {
                id: userGroupId,
                library: 'users_groups'
            },
            ctx
        });

        const parentPerm = await getPermissionByUserGroups(
            {
                type,
                action,
                userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
                applyTo,
                permissionTreeTarget,
                ctx
            },

            deps
        );

        if (parentPerm !== null) {
            return parentPerm;
        }

        const treeElemAncestors = await treeRepo.getElementAncestors({
            treeId: permissionTreeTarget.tree,
            element: {
                id: permissionTreeTarget.id,
                library: permissionTreeTarget.library
            },
            ctx
        });

        // If nothing found, get herited perm via tree
        const perm = await getPermTreePermission(
            {
                type,
                action,
                applyTo,
                userGroupsPaths: [groupAncestors],
                permTreeId: permissionTreeTarget.tree,
                permTreeVal: treeElemAncestors.slice(0, -1),
                ctx
            },
            deps
        );

        if (perm !== null) {
            return perm;
        }

        // Nothing found? Return library permission
        const libPerm = await getDefaultPermission({
            action,
            applyTo,
            userGroups: [groupAncestors]
        });

        return libPerm !== null ? libPerm : getGlobalDefaultPermission(config);
    };

    return {
        getTreeBasedPermission,
        getHeritedTreeBasedPermission
    };
}
