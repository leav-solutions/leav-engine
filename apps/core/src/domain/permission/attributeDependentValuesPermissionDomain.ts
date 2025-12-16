// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type IQueryInfos} from '_types/queryInfos';
import {type IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
import {type IValueRepo} from 'infra/value/valueRepo';
import {
    type AttributeDependentValuesPermissionsActions,
    type IPermissionsDependentTreeTarget,
    PermissionTypes,
} from '../../_types/permissions';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {type IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {type IDefaultPermissionHelper} from './helpers/defaultPermission';
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

    // TODO getInheritedAttributeDependentValuesPermission
}

export interface IRecordAttributePermissionDomainDeps {
    'core.domain.permission.helpers.permissionByUserGroups': IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.infra.value': IValueRepo;
    config: IConfig;
}

export default function (deps: IRecordAttributePermissionDomainDeps): IAttributeDependentValuesPermissionDomain {
    const {
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
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
                attrProps.permissions_conf_dependent_values?.dependentValuesTreeAttributes == null ||
                attrProps.permissions_conf_dependent_values?.dependentValuesTreeAttributes.length === 0
            ) {
                return true;
            }

            const dependentTreeTargets: IPermissionsDependentTreeTarget[] = await _getDependentTreeTargets(
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

            const _getDefaultPermission = () =>
                // May be we should check attribute or record attribute permission
                defaultPermHelper.getDefaultPermission({
                    type: PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES,
                    action,
                    userGroups: userGroupsPaths,
                    ctx,
                });

            return permByUserGroupsHelper.getPermissionByUserGroups({
                type: PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES,
                action,
                userGroupsPaths,
                applyTo: attributeId,
                treeTarget,
                dependentTreeTargets,
                getDefaultGlobalPermission: _getDefaultPermission,
                ctx,
            });
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

    async function _getDependentTreeTargets(
        attrProps: IAttribute,
        ctx: IQueryInfos,
        recordLibrary: string,
        recordId: string,
    ): Promise<IPermissionsDependentTreeTarget[]> {
        return Promise.all(
            attrProps.permissions_conf_dependent_values.dependentValuesTreeAttributes.map(
                async (permDependentTreeAttrId): Promise<IPermissionsDependentTreeTarget> => {
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
