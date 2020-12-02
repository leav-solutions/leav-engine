// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {
    AttributePermissionsActions,
    PermissionTypes,
    RecordAttributePermissionsActions
} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IAttributePermissionDomain} from './attributePermissionDomain';
import getDefaultPermission from './helpers/getDefaultPermission';
import getPermissionByUserGroups from './helpers/getPermissionByUserGroups';
import {IPermissionDomain} from './permissionDomain';
import {IGetDefaultPermissionParams, ITreePermissionDomain} from './treePermissionDomain';
import {IGetRecordAttributeHeritedPermissionsParams} from './_types';

export interface IRecordAttributePermissionDomain {
    getRecordAttributePermission(
        action: RecordAttributePermissionsActions,
        userGroupId: string,
        attributeId: string,
        recordLibrary: string,
        recordId: string,
        ctx: IQueryInfos
    ): Promise<boolean>;

    getHeritedRecordAttributePermission(
        params: IGetRecordAttributeHeritedPermissionsParams,
        ctx: IQueryInfos
    ): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission'?: IPermissionDomain;
    'core.domain.permission.attribute'?: IAttributePermissionDomain;
    'core.domain.permission.tree'?: ITreePermissionDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.value'?: IValueRepo;
    'core.infra.permission'?: IPermissionRepo;
    config?: IConfig;
}

export default function(deps: IDeps = {}): IRecordAttributePermissionDomain {
    const {
        'core.domain.permission.tree': treePermissionDomain = null,
        'core.domain.permission.attribute': attrPermissionDomain = null,
        'core.domain.attribute': attributeDomain = null,
        'core.infra.value': valueRepo = null,
        config = null
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
                        (action as unknown) as AttributePermissionsActions
                    ) !== -1;

                return isAttrAction
                    ? attrPermissionDomain.getAttributePermission({
                          action: (action as unknown) as AttributePermissionsActions,
                          attributeId,
                          ctx
                      })
                    : getDefaultPermission(config);
            }

            const treesAttrValues = await Promise.all(
                attrProps.permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                    return valueRepo.getValues({
                        library: recordLibrary,
                        recordId,
                        attribute: permTreeAttrProps,
                        ctx
                    });
                })
            );

            const valuesByAttr = treesAttrValues.reduce((allVal, treeVal, i) => {
                allVal[attrProps.permissions_conf.permissionTreeAttributes[i]] = treeVal.map(v => v.value);

                return allVal;
            }, {});

            const perm = treePermissionDomain.getTreePermission(
                {
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    action,
                    userId,
                    applyTo: attributeId,
                    treeValues: valuesByAttr,
                    permissions_conf: attrProps.permissions_conf,
                    getDefaultPermission: () =>
                        attrPermissionDomain.getAttributePermission({
                            action: (action as unknown) as AttributePermissionsActions,
                            attributeId,
                            ctx
                        })
                },
                ctx
            );

            return perm;
        },
        async getHeritedRecordAttributePermission(
            {action, attributeId, userGroupId, permTree, permTreeNode}: IGetRecordAttributeHeritedPermissionsParams,
            ctx: IQueryInfos
        ): Promise<boolean> {
            const _getDefaultPermission = async (params: IGetDefaultPermissionParams) => {
                const {applyTo, userGroups} = params;

                const libPerm = await getPermissionByUserGroups(
                    {
                        type: PermissionTypes.ATTRIBUTE,
                        action,
                        userGroupsPaths: userGroups,
                        applyTo,
                        ctx
                    },
                    deps
                );

                return libPerm !== null ? libPerm : getDefaultPermission(config);
            };

            return treePermissionDomain.getHeritedTreePermission(
                {
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    applyTo: attributeId,
                    action,
                    userGroupId,
                    permissionTreeTarget: {tree: permTree, ...permTreeNode},
                    getDefaultPermission: _getDefaultPermission
                },
                ctx
            );
        }
    };
}
