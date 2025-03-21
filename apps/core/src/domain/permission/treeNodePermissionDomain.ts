// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';
import {IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {ITree, ITreeElement} from '_types/tree';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {
    ITreeNodePermissionsConf,
    PermissionTypes,
    TreeNodePermissionsActions,
    TreePermissionsActions
} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IDefaultPermissionHelper} from './helpers/defaultPermission';
import {IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import {ITreeLibraryPermissionDomain} from './treeLibraryPermissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';
import {
    IGetDefaultPermissionParams,
    IGetInheritedTreeNodePermissionParams,
    IGetTreeNodePermissionParams
} from './_types';

export interface ITreeNodePermissionDomain {
    getTreeNodePermission(params: IGetTreeNodePermissionParams): Promise<boolean>;
    getInheritedTreeNodePermission(params: IGetInheritedTreeNodePermissionParams): Promise<boolean>;
}

export interface ITreeNodePermissionDomainDeps {
    'core.domain.permission.tree': ITreePermissionDomain;
    'core.domain.permission.treeLibrary': ITreeLibraryPermissionDomain;
    'core.domain.permission.helpers.treeBasedPermissions': ITreeBasedPermissionHelper;
    'core.domain.permission.helpers.permissionByUserGroups': IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.infra.tree': ITreeRepo;
    'core.domain.attribute': IAttributeDomain;
    'core.infra.value': IValueRepo;
}

export default function (deps: ITreeNodePermissionDomainDeps): ITreeNodePermissionDomain {
    const {
        'core.domain.permission.tree': treePermissionDomain,
        'core.domain.permission.treeLibrary': treeLibraryPermissionDomain,
        'core.domain.permission.helpers.treeBasedPermissions': treeBasedPermissionsHelper,
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupHelper,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
        'core.domain.helpers.getCoreEntityById': getCoreEntityById,
        'core.infra.tree': treeRepo,
        'core.domain.attribute': attributeDomain,
        'core.infra.value': valueRepo = null
    } = deps;

    const _getPermByTreeNode = async (params: {
        action: TreeNodePermissionsActions;
        userId: string;
        treeId: string;
        permConf: ITreeNodePermissionsConf;
        treeElement: ITreeElement;
        ctx: IQueryInfos;
    }) => {
        const {action, userId, treeId, permConf, treeElement, ctx} = params;
        const {id: recordId, library} = treeElement;

        const _getTreePermission = () =>
            treePermissionDomain.getTreePermission({
                action: action as unknown as TreePermissionsActions,
                userId,
                treeId,
                ctx
            });

        if (!permConf?.[library]) {
            return treeLibraryPermissionDomain.getTreeLibraryPermission({
                action,
                treeId,
                libraryId: library,
                userId,
                ctx,
                getDefaultPermission: _getTreePermission
            });
        }

        // Get tree attributes values
        const treesAttrValues = await Promise.all(
            permConf[library].permissionTreeAttributes.map(async permTreeAttr => {
                const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                return valueRepo.getValues({
                    library,
                    recordId,
                    attribute: permTreeAttrProps as IAttributeWithRevLink,
                    ctx
                });
            })
        );

        const valuesByAttr = treesAttrValues.reduce((allVal, treeVal, i) => {
            allVal[permConf[library].permissionTreeAttributes[i]] = treeVal.map(v => v.payload.id);

            return allVal;
        }, {});

        const _getDefaultPermission = () =>
            treeLibraryPermissionDomain.getTreeLibraryPermission({
                action,
                treeId,
                libraryId: library,
                userId,
                ctx,
                getDefaultPermission: _getTreePermission
            });

        return treeBasedPermissionsHelper.getTreeBasedPermission(
            {
                type: PermissionTypes.TREE_NODE,
                action,
                userId,
                applyTo: `${treeId}/${library}`,
                treeValues: valuesByAttr,
                permissions_conf: permConf[library],
                getDefaultPermission: _getDefaultPermission
            },
            ctx
        );
    };

    return {
        async getTreeNodePermission({action, userId, nodeId, treeId, ctx}): Promise<boolean> {
            // Retrieve permissions conf for this node library
            // Call repo instead of domain to avoid some cyclic reference issues
            const nodeRecord = await treeRepo.getRecordByNodeId({treeId, nodeId, ctx});
            if (!nodeRecord) {
                return treePermissionDomain.getTreePermission({
                    action: action as unknown as TreePermissionsActions,
                    userId,
                    treeId,
                    ctx
                });
            }

            const nodeElement = {id: nodeRecord.id, library: nodeRecord.library};

            const treeData = await getCoreEntityById<ITree>('tree', treeId, ctx);
            if (!treeData) {
                throw new ValidationError({
                    id: Errors.UNKNOWN_TREE
                });
            }

            // Retrieve permissions for this element, based on tree permissions conf
            return _getPermByTreeNode({
                action: action as unknown as TreeNodePermissionsActions,
                userId,
                treeId,
                permConf: treeData.permissions_conf,
                treeElement: nodeElement,
                ctx
            });
        },
        async getInheritedTreeNodePermission({
            action,
            userGroupId,
            treeId,
            libraryId,
            permTree,
            permTreeNode,
            ctx
        }): Promise<boolean> {
            const _getDefaultPermission = (params: IGetDefaultPermissionParams) =>
                permByUserGroupHelper.getPermissionByUserGroups({
                    type: PermissionTypes.TREE_LIBRARY,
                    action,
                    userGroupsPaths: params.userGroups,
                    applyTo: `${treeId}/${libraryId}`,
                    getDefaultPermission: () =>
                        permByUserGroupHelper.getPermissionByUserGroups({
                            type: PermissionTypes.TREE,
                            action,
                            userGroupsPaths: params.userGroups,
                            applyTo: treeId,
                            ctx
                        }),
                    ctx
                });

            return treeBasedPermissionsHelper.getInheritedTreeBasedPermission(
                {
                    type: PermissionTypes.TREE_NODE,
                    applyTo: `${treeId}/${libraryId}`,
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
