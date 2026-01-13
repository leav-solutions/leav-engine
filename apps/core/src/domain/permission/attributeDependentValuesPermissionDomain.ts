// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type IQueryInfos} from '_types/queryInfos';
import {type IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
import {type IValueRepo} from 'infra/value/valueRepo';
import {
    type AttributeDependentValuesPermissionsActions,
    type IPermissionsDependenciesTreeTarget,
    type IPermissionsTreeTarget,
    PermissionTypes,
} from '../../_types/permissions';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {type IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {type IAttribute} from '_types/attribute';
import {type TreePath} from '_types/tree';
import {type IConfig} from '_types/config';

export interface IAttributeDependentValuesPermissionDomain {
    getAttributeDependentValuesPermission(params: {
        action: AttributeDependentValuesPermissionsActions;
        attributeId: string;
        recordLibrary: string;
        recordId: string;
        valueNodeId: string;
        ctx: IQueryInfos;
    }): Promise<boolean>;

    getInheritedAttributeDependentValuesPermission(params: {
        action: AttributeDependentValuesPermissionsActions;
        attributeId: string;
        userGroupId: string;
        permissionTreeTarget: IPermissionsTreeTarget;
        dependenciesTreeTargets: IPermissionsDependenciesTreeTarget[];
        ctx: IQueryInfos;
    }): Promise<boolean>;

    filterAllowedDependentValuesOnItself(params: {
        action: AttributeDependentValuesPermissionsActions;
        attributeId: string;
        targetValue: {nodeId: string | null};
        allValues: Array<{nodeId: string | null}>;
        ctx: IQueryInfos;
    }): Promise<Array<{nodeId: string | null}>>;
}

export interface IRecordAttributePermissionDomainDeps {
    'core.domain.permission.helpers.permissionByUserGroups': IPermissionByUserGroupsHelper;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.infra.value': IValueRepo;
    config: IConfig;
}

export default function (deps: IRecordAttributePermissionDomainDeps): IAttributeDependentValuesPermissionDomain {
    const {
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper,
        'core.domain.attribute': attributeDomain,
        'core.domain.tree.helpers.elementAncestors': elementAncestorsHelper,
        'core.infra.value': valueRepo,
        config,
    } = deps;

    return {
        async getAttributeDependentValuesPermission(params: {
            action: AttributeDependentValuesPermissionsActions;
            attributeId: string;
            recordLibrary: string;
            recordId: string;
            valueNodeId: string;
            ctx: IQueryInfos;
        }): Promise<boolean> {
            // Temporary allow disable that permission check in case of bug will still in dev/recette
            if (!config.permissions.enableAttributeDependentValuesPermissions) {
                return true;
            }

            const {action, attributeId, recordLibrary, recordId, valueNodeId, ctx} = params;
            const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});

            // If no dependent values configuration, allow to set any value by default
            if (
                attrProps.permissions_conf_dependent_values?.dependenciesTreeAttributes == null ||
                attrProps.permissions_conf_dependent_values?.dependenciesTreeAttributes.length === 0
            ) {
                return true;
            }

            const dependenciesTreeTargets: IPermissionsDependenciesTreeTarget[] = await _getDependenciesTreeTargets(
                attrProps,
                ctx,
                recordLibrary,
                recordId,
            );

            const userGroupsPaths = !!ctx.groupsId
                ? await Promise.all(
                      ctx.groupsId.map(async groupId =>
                          elementAncestorsHelper.getCachedElementAncestors({
                              treeId: 'users_groups',
                              nodeId: groupId,
                              ctx,
                          }),
                      ),
                  )
                : [];

            const treeTarget = await _getValuesTreeTarget(attrProps, valueNodeId, ctx);

            const _getDefaultPermission = () => attrProps.permissions_conf_dependent_values.allowByDefault;

            return permByUserGroupsHelper.getPermissionByUserGroups({
                type: PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES,
                action,
                userGroupsPaths,
                applyTo: attributeId,
                treeTarget,
                dependenciesTreeTargets,
                getDefaultGlobalPermission: _getDefaultPermission,
                ctx,
            });
        },
        async getInheritedAttributeDependentValuesPermission(params: {
            action: AttributeDependentValuesPermissionsActions;
            attributeId: string;
            userGroupId: string;
            permissionTreeTarget: IPermissionsTreeTarget;
            dependenciesTreeTargets: IPermissionsDependenciesTreeTarget[];
            ctx: IQueryInfos;
        }): Promise<boolean> {
            // Temporary allow disable that permission check in case of bug will still in dev/recette
            if (!config.permissions.enableAttributeDependentValuesPermissions) {
                return true;
            }

            const {action, attributeId, userGroupId, permissionTreeTarget, dependenciesTreeTargets, ctx} = params;
            if (!dependenciesTreeTargets || dependenciesTreeTargets.length === 0) {
                throw new Error(
                    'Attribute dependent values permission inheritance requires at least one dependent tree target',
                );
            }

            const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});

            // If no dependent values configuration, allow to set any value by default
            if (
                attrProps.permissions_conf_dependent_values?.dependenciesTreeAttributes == null ||
                attrProps.permissions_conf_dependent_values?.dependenciesTreeAttributes.length === 0
            ) {
                return true;
            }

            // Get perm for user group's parent
            const groupAncestors = await elementAncestorsHelper.getCachedElementAncestors({
                treeId: 'users_groups',
                nodeId: userGroupId,
                ctx,
            });

            // get tree target path
            const treeTargetPath = await elementAncestorsHelper.getCachedElementAncestors({
                treeId: permissionTreeTarget.tree,
                nodeId: permissionTreeTarget.nodeId,
                ctx,
            });

            const inheritedGroupTargetPermission = await permByUserGroupsHelper.getPermissionByUserGroups({
                type: PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES,
                action,
                userGroupsPaths: [groupAncestors.slice(0, -1)],
                applyTo: attributeId,
                treeTarget: {tree: permissionTreeTarget.tree, path: [{id: permissionTreeTarget.nodeId}]},
                dependenciesTreeTargets,
                getDefaultGlobalPermission: () => null,
                ctx,
            });

            if (inheritedGroupTargetPermission !== null) {
                return inheritedGroupTargetPermission;
            }

            const inheritedTargetPathPermission = await permByUserGroupsHelper.getPermissionByUserGroups({
                type: PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES,
                action,
                userGroupsPaths: [groupAncestors],
                applyTo: attributeId,
                treeTarget: {
                    tree: permissionTreeTarget.tree,
                    path: [{id: null}, ...treeTargetPath.slice(0, -1)],
                },
                dependenciesTreeTargets,
                getDefaultGlobalPermission: () => null,
                ctx,
            });

            if (inheritedTargetPathPermission !== null) {
                return inheritedTargetPathPermission;
            }

            return attrProps.permissions_conf_dependent_values.allowByDefault;
        },
        async filterAllowedDependentValuesOnItself(params: {
            action: AttributeDependentValuesPermissionsActions;
            attributeId: string;
            targetValue: {nodeId: string | null};
            allValues: Array<{nodeId: string | null}>;
            ctx: IQueryInfos;
        }): Promise<Array<{nodeId: string | null}>> {
            const {action, attributeId, targetValue, allValues, ctx} = params;

            // Temporary allow disable that permission check in case of bug will still in dev/recette
            if (!config.permissions.enableAttributeDependentValuesPermissions) {
                return allValues;
            }

            const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});

            // If no dependent values configuration, allow to set any value by default
            if (
                attrProps.permissions_conf_dependent_values?.dependenciesTreeAttributes == null ||
                attrProps.permissions_conf_dependent_values?.dependenciesTreeAttributes.length === 0
            ) {
                return allValues;
            }

            if (
                attrProps.permissions_conf_dependent_values.dependenciesTreeAttributes.length > 1 ||
                attrProps.permissions_conf_dependent_values.dependenciesTreeAttributes[0] !== attributeId
            ) {
                throw new Error(
                    'Attribute dependent values permission on itself can only be used on tree attributes depending on itself',
                );
            }

            const dependenciesTreeTargets: IPermissionsDependenciesTreeTarget[] = [
                {
                    attributeId,
                    tree: attrProps.linked_tree,
                    nodeId: targetValue.nodeId,
                },
            ];
            const userGroupsPaths = !!ctx.groupsId
                ? await Promise.all(
                      ctx.groupsId.map(async groupId =>
                          elementAncestorsHelper.getCachedElementAncestors({
                              treeId: 'users_groups',
                              nodeId: groupId,
                              ctx,
                          }),
                      ),
                  )
                : [];

            const _getDefaultPermission = () => attrProps.permissions_conf_dependent_values.allowByDefault;

            const allowedValues = await Promise.all(
                allValues
                    .filter(value => value.nodeId !== targetValue.nodeId)
                    .map(async value => {
                        const treeTarget = await _getValuesTreeTarget(attrProps, value.nodeId, ctx);

                        const isAllow = await permByUserGroupsHelper.getPermissionByUserGroups({
                            type: PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES,
                            action,
                            userGroupsPaths,
                            applyTo: attributeId,
                            treeTarget,
                            dependenciesTreeTargets,
                            getDefaultGlobalPermission: _getDefaultPermission,
                            ctx,
                        });

                        return isAllow ? value : null;
                    }),
            );

            return allowedValues.filter(Boolean);
        },
    };

    async function _getValuesTreeTarget(
        attrProps: IAttribute,
        valueNodeId: string,
        ctx: IQueryInfos,
    ): Promise<{tree: string; path: TreePath}> {
        const targetPath = await elementAncestorsHelper.getCachedElementAncestors({
            treeId: attrProps.linked_tree,
            nodeId: valueNodeId,
            ctx,
        });

        return {
            path: [{id: null}, ...targetPath],
            tree: attrProps.linked_tree,
        };
    }

    async function _getDependenciesTreeTargets(
        attrProps: IAttribute,
        ctx: IQueryInfos,
        recordLibrary: string,
        recordId: string,
    ): Promise<IPermissionsDependenciesTreeTarget[]> {
        return Promise.all(
            attrProps.permissions_conf_dependent_values.dependenciesTreeAttributes.map(
                async (permDependentTreeAttrId): Promise<IPermissionsDependenciesTreeTarget> => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties({
                        id: permDependentTreeAttrId,
                        ctx,
                    });
                    const values = await valueRepo.getValues({
                        library: recordLibrary,
                        recordId,
                        attribute: permTreeAttrProps as IAttributeWithRevLink,
                        ctx,
                    });

                    if (values.length > 1) {
                        logger.silly(
                            'Attribute dependent values permission can only be used on mono value tree attributes. ' +
                                `Attribute ${permDependentTreeAttrId} on record ${recordId} has multiple values, ` +
                                'so permission check will use the first one.',
                        );
                    }

                    return {
                        attributeId: permDependentTreeAttrId,
                        tree: permTreeAttrProps.linked_tree,
                        nodeId: values[0]?.payload.id ?? null,
                    };
                },
            ),
        );
    }
}
