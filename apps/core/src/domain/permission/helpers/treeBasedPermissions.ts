// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {TreePaths} from '_types/tree';
import {PermissionsActions, PermissionsRelations, PermissionTypes} from '../../../_types/permissions';
import {IGetInheritedTreeBasedPermissionParams, IGetTreeBasedPermissionParams} from '../_types';
import {IDefaultPermissionHelper} from './defaultPermission';
import {IPermissionByUserGroupsHelper} from './permissionByUserGroups';
import {IReducePermissionsArrayHelper} from './reducePermissionsArray';
import getPermissionsCacheKey from './getPermissionsCacheKey';
import {ECacheType, ICacheService} from '../../../infra/cache/cacheService';

interface IDeps {
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission.helpers.permissionByUserGroups'?: IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission'?: IDefaultPermissionHelper;
    'core.domain.permission.helpers.reducePermissionsArray'?: IReducePermissionsArrayHelper;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.permission'?: IPermissionRepo;
    'core.infra.value'?: IValueRepo;
    'core.infra.cache.cacheService'?: ICacheService;
    config?: IConfig;
}

export interface ITreeBasedPermissionHelper {
    getTreeBasedPermission(params: IGetTreeBasedPermissionParams, ctx: IQueryInfos): Promise<boolean>;
    getInheritedTreeBasedPermission(params: IGetInheritedTreeBasedPermissionParams, ctx: IQueryInfos): Promise<boolean>;
}

export default function(deps: IDeps): ITreeBasedPermissionHelper {
    const {
        'core.domain.attribute': attributeDomain = null,
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper = null,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper = null,
        'core.domain.permission.helpers.reducePermissionsArray': reducePermissionsArrayHelper = null,
        'core.infra.tree': treeRepo = null,
        'core.infra.value': valueRepo = null,
        'core.infra.cache.cacheService': cacheService = null,
        config = null
    } = deps;

    /**
     * Return permission for given permission tree attribute.
     * Get record's value on this tree attribute, then run through its ancestors to look for any permission defined
     *
     * @param params
     */
    const _getPermTreePermission = async (params: {
        type: PermissionTypes;
        action: PermissionsActions;
        applyTo: string;
        userGroupsPaths: TreePaths[];
        permTreeId: string;
        permTreeValues: string[];
        ctx: IQueryInfos;
    }): Promise<boolean | null> => {
        const {type, action, applyTo, userGroupsPaths, permTreeId, permTreeValues, ctx} = params;

        if (permTreeValues.length) {
            // Get permissions for all values, then check if we're allowed somewhere
            const allValuesPermissions = await Promise.all(
                permTreeValues.map(
                    // Permissions for each values of tree attribute
                    async (value): Promise<boolean | null> => {
                        const permTreePath = await treeRepo.getElementAncestors({
                            // Ancestors of value
                            treeId: permTreeId,
                            nodeId: value,
                            ctx
                        });

                        let perm = null;
                        for (const pathElem of permTreePath.reverse()) {
                            const valuePerm = await permByUserGroupsHelper.getPermissionByUserGroups({
                                type,
                                action,
                                userGroupsPaths,
                                applyTo,
                                permissionTreeTarget: {
                                    nodeId: pathElem.id,
                                    tree: permTreeId
                                },
                                ctx
                            });

                            if (valuePerm !== null) {
                                perm = valuePerm;
                                break;
                            }
                        }

                        return perm;
                    }
                )
            );

            // Looks for a true somewhere, but keeps null if everything is null
            const perm = reducePermissionsArrayHelper.reducePermissionsArray(allValuesPermissions);

            if (perm !== null) {
                return perm;
            }
        }

        // Nothing found on tree or no value defined, return root level permission
        const rootPerm = await permByUserGroupsHelper.getPermissionByUserGroups({
            type,
            action,
            userGroupsPaths,
            applyTo,
            permissionTreeTarget: {
                nodeId: null,
                tree: permTreeId
            },
            ctx
        });

        return rootPerm;
    };

    const getTreeBasedPermission = async (
        params: IGetTreeBasedPermissionParams,
        ctx: IQueryInfos
    ): Promise<boolean> => {
        const {type, action, userId, applyTo, treeValues, permissions_conf, getDefaultPermission} = params;

        if (!permissions_conf.permissionTreeAttributes.length) {
            return getDefaultPermission({action, applyTo, userId});
        }

        const key = permissions_conf.permissionTreeAttributes.reduce((acc, permTreeAttr) => {
            const values = treeValues[permTreeAttr];
            return values.length ? acc + `${acc.length ? '_' : ''}${values.join('_')}` : acc;
        }, '');

        const cacheKey = getPermissionsCacheKey(ctx.groupsId, type, applyTo, action, key);
        const permFromCache = (await cacheService.getData(ECacheType.RAM, [cacheKey]))[0];

        let perm: boolean;

        if (permFromCache !== null) {
            perm = permFromCache === 'true';
        } else {
            const userGroupsPaths = !!ctx.groupsId
                ? await Promise.all(
                      ctx.groupsId.map(async groupId => {
                          const groupNodeId = await treeRepo.getNodesByRecord({
                              treeId: 'users_groups',
                              record: {id: groupId, library: 'user_groups'},
                              ctx
                          });

                          return treeRepo.getElementAncestors({
                              treeId: 'users_groups',
                              nodeId: groupNodeId[0],
                              ctx
                          });
                      })
                  )
                : [];

            const treePerms = await Promise.all(
                permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                    const treePerm = await _getPermTreePermission({
                        type,
                        action,
                        applyTo,
                        userGroupsPaths,
                        permTreeId: permTreeAttrProps.linked_tree,
                        permTreeValues: treeValues[permTreeAttr],
                        ctx
                    });

                    return treePerm ?? getDefaultPermission({action, applyTo, userId});
                })
            );

            perm = treePerms.reduce((globalPerm, treePerm) => {
                if (globalPerm === null) {
                    return treePerm;
                }

                return permissions_conf.relation === PermissionsRelations.AND
                    ? globalPerm && treePerm
                    : globalPerm || treePerm;
            }, null);

            if (perm !== null) {
                await cacheService.storeData(ECacheType.RAM, cacheKey, perm.toString());
            }
        }

        return perm;
    };

    const getInheritedTreeBasedPermission = async (
        params: IGetInheritedTreeBasedPermissionParams,
        ctx: IQueryInfos
    ): Promise<boolean> => {
        const {type, action, userGroupId, applyTo, permissionTreeTarget, getDefaultPermission} = params;

        // Get perm for user group's parent
        const groupAncestors = await treeRepo.getElementAncestors({
            treeId: 'users_groups',
            nodeId: userGroupId,
            ctx
        });

        const parentPerm = await permByUserGroupsHelper.getPermissionByUserGroups({
            type,
            action,
            userGroupsPaths: [groupAncestors.slice(0, -1)], // Start from parent group
            applyTo,
            permissionTreeTarget,
            ctx
        });

        if (parentPerm !== null) {
            return parentPerm;
        }

        const treeElemAncestors = await treeRepo.getElementAncestors({
            treeId: permissionTreeTarget.tree,
            nodeId: permissionTreeTarget.nodeId,
            ctx
        });

        const perm = await _getPermTreePermission({
            type,
            action,
            applyTo,
            userGroupsPaths: [groupAncestors],
            permTreeId: permissionTreeTarget.tree,
            permTreeValues: treeElemAncestors.map(anc => anc.id),
            ctx
        });

        if (perm !== null) {
            return perm;
        }

        // Nothing found? Return library permission
        const libPerm = await getDefaultPermission({
            action,
            applyTo,
            userGroups: [groupAncestors]
        });

        return libPerm !== null ? libPerm : defaultPermHelper.getDefaultPermission();
    };

    return {
        getTreeBasedPermission,
        getInheritedTreeBasedPermission
    };
}
