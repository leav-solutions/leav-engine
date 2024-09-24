// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {
    AttributePermissionsActions,
    PermissionTypes,
    RecordAttributePermissionsActions
} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IAttributePermissionDomain} from './attributePermissionDomain';
import {IDefaultPermissionHelper} from './helpers/defaultPermission';
import {IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import {
    IGetDefaultPermissionParams,
    IGetRecordAttributeHeritedPermissionsParams as IGetRecordAttributeInheritedPermissionsParams
} from './_types';

export interface IRecordAttributePermissionDomain {
    getRecordAttributePermission(
        action: RecordAttributePermissionsActions,
        userGroupId: string,
        attributeId: string,
        recordLibrary: string,
        recordId: string,
        ctx: IQueryInfos
    ): Promise<boolean>;

    getInheritedRecordAttributePermission(
        params: IGetRecordAttributeInheritedPermissionsParams,
        ctx: IQueryInfos
    ): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.attribute'?: IAttributePermissionDomain;
    'core.domain.permission.helpers.treeBasedPermissions'?: ITreeBasedPermissionHelper;
    'core.domain.permission.helpers.permissionByUserGroups'?: IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission'?: IDefaultPermissionHelper;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.value'?: IValueRepo;
}

export default function (deps: IDeps = {}): IRecordAttributePermissionDomain {
    const {
        'core.domain.permission.attribute': attrPermissionDomain = null,
        'core.domain.permission.helpers.treeBasedPermissions': treeBasedPermissionsHelper = null,
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper = null,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper = null,
        'core.domain.attribute': attributeDomain = null,
        'core.infra.value': valueRepo = null
    } = deps;
    return {
        async getRecordAttributePermission(
            action: RecordAttributePermissionsActions,
            userId: string,
            attributeId: string,
            recordLibrary: string,
            recordId: string,
            ctx: IQueryInfos
        ): Promise<boolean> {
            const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});
            if (typeof attrProps.permissions_conf === 'undefined') {
                // Check if action is present in library permissions
                const isAttrAction =
                    Object.values(AttributePermissionsActions).indexOf(
                        action as unknown as AttributePermissionsActions
                    ) !== -1;

                return isAttrAction
                    ? attrPermissionDomain.getAttributePermission({
                          action: action as unknown as AttributePermissionsActions,
                          attributeId,
                          ctx
                      })
                    : defaultPermHelper.getDefaultPermission();
            }

            const treesAttrValues = await Promise.all(
                attrProps.permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                    return valueRepo.getValues({
                        library: recordLibrary,
                        recordId,
                        attribute: permTreeAttrProps as IAttributeWithRevLink,
                        ctx
                    });
                })
            );

            const valuesByAttr = treesAttrValues.reduce((allVal, treeVal, i) => {
                allVal[attrProps.permissions_conf.permissionTreeAttributes[i]] = treeVal.map(v => v.payload.id);

                return allVal;
            }, {});

            const perm = treeBasedPermissionsHelper.getTreeBasedPermission(
                {
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    action,
                    userId,
                    applyTo: attributeId,
                    treeValues: valuesByAttr,
                    permissions_conf: attrProps.permissions_conf,
                    getDefaultPermission: () =>
                        attrPermissionDomain.getAttributePermission({
                            action: action as unknown as AttributePermissionsActions,
                            attributeId,
                            ctx
                        })
                },
                ctx
            );

            return perm;
        },
        async getInheritedRecordAttributePermission(
            {action, attributeId, userGroupId, permTree, permTreeNode},
            ctx: IQueryInfos
        ): Promise<boolean> {
            const _getDefaultPermission = async (params: IGetDefaultPermissionParams) => {
                const {applyTo, userGroups} = params;

                const libPerm = await permByUserGroupsHelper.getPermissionByUserGroups({
                    type: PermissionTypes.ATTRIBUTE,
                    action,
                    userGroupsPaths: userGroups,
                    applyTo,
                    ctx
                });

                return libPerm !== null ? libPerm : defaultPermHelper.getDefaultPermission();
            };

            return treeBasedPermissionsHelper.getInheritedTreeBasedPermission(
                {
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    applyTo: attributeId,
                    action,
                    userGroupId,
                    permissionTreeTarget: {tree: permTree, nodeId: permTreeNode},
                    getDefaultPermission: _getDefaultPermission
                },
                ctx
            );
        }
    };
}
