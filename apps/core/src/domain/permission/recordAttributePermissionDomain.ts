// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
import {type IValueRepo} from 'infra/value/valueRepo';
import {type IQueryInfos} from '_types/queryInfos';
import {
    AttributePermissionsActions,
    PermissionTypes,
    type RecordAttributePermissionsActions,
} from '../../_types/permissions';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IAttributePermissionDomain} from './attributePermissionDomain';
import {type IDefaultPermissionHelper} from './helpers/defaultPermission';
import {type IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {type ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import {
    type IGetDefaultGlobalPermissionParams,
    type IGetRecordAttributeHeritedPermissionsParams as IGetRecordAttributeInheritedPermissionsParams,
} from './_types';
import {type IRecordRepo} from '../../infra/record/recordRepo';
import {type IRecordInCreationBypassHelper} from './helpers/recordInCreationBypass';

export interface IRecordAttributePermissionDomain {
    getRecordAttributePermission(
        action: RecordAttributePermissionsActions,
        userGroupId: string,
        attributeId: string,
        recordLibrary: string,
        recordId: string,
        ctx: IQueryInfos,
    ): Promise<boolean>;

    getInheritedRecordAttributePermission(
        params: IGetRecordAttributeInheritedPermissionsParams,
        ctx: IQueryInfos,
    ): Promise<boolean>;
}

export interface IRecordAttributePermissionDomainDeps {
    'core.domain.permission.attribute': IAttributePermissionDomain;
    'core.domain.permission.helpers.treeBasedPermissions': ITreeBasedPermissionHelper;
    'core.domain.permission.helpers.permissionByUserGroups': IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.domain.permission.helpers.recordInCreationBypass': IRecordInCreationBypassHelper;
    'core.domain.attribute': IAttributeDomain;
    'core.infra.value': IValueRepo;
    'core.infra.record': IRecordRepo;
}

export default function (deps: IRecordAttributePermissionDomainDeps): IRecordAttributePermissionDomain {
    const {
        'core.domain.permission.attribute': attrPermissionDomain,
        'core.domain.permission.helpers.treeBasedPermissions': treeBasedPermissionsHelper,
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupsHelper,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
        'core.domain.permission.helpers.recordInCreationBypass': recordInCreationBypassHelper,
        'core.domain.attribute': attributeDomain,
        'core.infra.value': valueRepo,
        'core.infra.record': recordRepo,
    } = deps;
    return {
        async getRecordAttributePermission(
            action: RecordAttributePermissionsActions,
            userId: string,
            attributeId: string,
            recordLibrary: string,
            recordId: string,
            ctx: IQueryInfos,
        ): Promise<boolean> {
            const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});
            if (
                typeof attrProps.permissions_conf === 'undefined' ||
                !attrProps.permissions_conf.permissionTreeAttributes.length
            ) {
                // Check if action is present in library permissions
                const isAttrAction =
                    Object.values(AttributePermissionsActions).indexOf(
                        action as unknown as AttributePermissionsActions,
                    ) !== -1;

                return isAttrAction
                    ? attrPermissionDomain.getAttributePermission({
                          action: action as unknown as AttributePermissionsActions,
                          attributeId,
                          ctx,
                      })
                    : defaultPermHelper.getDefaultPermission({ctx});
            }

            const treesAttrValues = await Promise.all(
                attrProps.permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                    return valueRepo.getValues({
                        library: recordLibrary,
                        recordId,
                        attribute: permTreeAttrProps as IAttributeWithRevLink,
                        ctx,
                    });
                }),
            );

            const valuesByAttr = treesAttrValues.reduce((allVal, treeVal, i) => {
                allVal[attrProps.permissions_conf.permissionTreeAttributes[i]] = treeVal.map(v => v.payload.id);

                return allVal;
            }, {});

            const _getDefaultPermission = () =>
                attrPermissionDomain.getAttributePermission({
                    action: action as unknown as AttributePermissionsActions,
                    attributeId,
                    ctx,
                });

            const treeBasedPermission = await treeBasedPermissionsHelper.getTreeBasedPermission(
                {
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    action,
                    userId,
                    applyTo: attributeId,
                    treeValues: valuesByAttr,
                    permissions_conf: attrProps.permissions_conf,
                    getDefaultPermission: _getDefaultPermission,
                },
                ctx,
            );

            // If record is in creation and user is the creator, we allow all actions
            if (treeBasedPermission === false) {
                const record = await recordRepo.getRecord({libraryId: recordLibrary, recordId, ctx});
                return recordInCreationBypassHelper.recordInCreationBypass(record, ctx);
            }

            return treeBasedPermission;
        },
        async getInheritedRecordAttributePermission(
            {action, attributeId, userGroupId, permTree, permTreeNode},
            ctx: IQueryInfos,
        ): Promise<boolean> {
            const _getDefaultPermission = (params: IGetDefaultGlobalPermissionParams) =>
                permByUserGroupsHelper.getPermissionByUserGroups({
                    type: PermissionTypes.ATTRIBUTE,
                    action,
                    userGroupsPaths: params.userGroups,
                    applyTo: params.applyTo,
                    ctx,
                });

            return treeBasedPermissionsHelper.getInheritedTreeBasedPermission(
                {
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    applyTo: attributeId,
                    action,
                    userGroupId,
                    permissionTreeTarget: {tree: permTree, nodeId: permTreeNode},
                    getDefaultPermission: _getDefaultPermission,
                },
                ctx,
            );
        },
    };
}
