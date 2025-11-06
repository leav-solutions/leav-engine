// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import _ from 'lodash';
import {type IAttribute} from '_types/attribute';
import {type ILibrary} from '_types/library';
import {PermissionTypes, RecordPermissionsActions} from '../../../_types/permissions';
import {type IQueryInfos} from '_types/queryInfos';
import {type ITreeNode} from '_types/tree';
import {type GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';
import {type IPermissionRepo} from 'infra/permission/permissionRepo';
import {type ITreeRepo} from 'infra/tree/treeRepo';
import {type IDefaultPermissionHelper} from 'domain/permission/helpers/defaultPermission';

interface IAccessPermissionFilterDeps {
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.infra.tree': ITreeRepo;
    'core.infra.permission': IPermissionRepo;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
}

interface INodeIdsByPermissions {
    true: Array<ITreeNode['id']>;
    false: Array<ITreeNode['id']>;
}

export interface IGetAccessPermissionsValue {
    treeId: string;
    attribute: IAttribute;
    permissions: INodeIdsByPermissions;
}

export type IGetAccessPermissions = (
    groupsIds: string[][],
    library: string,
    existingFiltersOnTreeIds: string[],
    deps: IAccessPermissionFilterDeps,
    ctx: IQueryInfos,
) => Promise<IGetAccessPermissionsValue[]>;

const getAccessPermissionsFilters: IGetAccessPermissions = async (
    groupsIds,
    library,
    existingFiltersOnTreeIds,
    deps,
    ctx,
) => {
    const {
        'core.domain.helpers.getCoreEntityById': getCoreEntityById,
        'core.infra.tree': treeRepo,
        'core.infra.permission': permissionRepo,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
    } = deps;

    const _computePermissionTree = (
        treeContent: ITreeNode[],
        parentPermission: boolean,
        permissionsByTreeTarget,
    ): any[] => {
        const result = treeContent.map(treeElem => {
            const treeElemWithPermission = {id: treeElem.id, children: [], permission: parentPermission};
            treeElemWithPermission.permission = permissionsByTreeTarget[`nodeId:${treeElem.id}`] ?? parentPermission;
            treeElemWithPermission.children = _computePermissionTree(
                treeElem.children,
                treeElemWithPermission.permission,
                permissionsByTreeTarget,
            );
            return treeElemWithPermission;
        });
        return result;
    };
    const _getNodesIdsByPermissionFromTree = (treeContent, result = {true: [], false: []}) => {
        result = treeContent.reduce((acc, elem) => {
            acc[elem.permission].push(elem.id);
            acc = _getNodesIdsByPermissionFromTree(elem.children, acc);
            return acc;
        }, result);
        return result;
    };

    // if user does not belong to any group, then we should pass at least one time in for loop in _getNodesIdByPermission to get default permissions
    const groupsIdsWithAncestorsId: string[][] = groupsIds.length ? groupsIds : [[]];

    const _getNodesIdByPermission = async (
        treeId: string,
        treeContent: ITreeNode[],
        action: RecordPermissionsActions.ACCESS_RECORD | RecordPermissionsActions.ACCESS_RECORD_BY_DEFAULT,
    ): Promise<INodeIdsByPermissions> => {
        const result: INodeIdsByPermissions = {
            true: [],
            false: [],
        };
        for (const groupWithAncestor of groupsIdsWithAncestorsId) {
            // we calc permissions group by group.
            // groupWithAncestor contains [definedGroupId, parentId, grandParentId, ...]
            const permissions = await permissionRepo.getAllPermissionsForTree({
                type: PermissionTypes.RECORD,
                applyTo: library,
                actionKey: action,
                treeId,
                groupsIds: groupWithAncestor,
                ctx,
            });

            // for each treeTarget we list all saved permission (null, true, false)
            const permissionsByTreeTarget = permissions.reduce((acc, p) => {
                acc[`nodeId:${p.permissionTreeTarget.nodeId}`] = acc[`nodeId:${p.permissionTreeTarget.nodeId}`] ?? [];

                acc[`nodeId:${p.permissionTreeTarget.nodeId}`].push(p.actions[action]);
                return acc;
            }, {});

            for (const key in permissionsByTreeTarget) {
                if (Object.hasOwn(permissionsByTreeTarget, key)) {
                    // if at least one of groups has explicit true, we set true
                    permissionsByTreeTarget[key] = permissionsByTreeTarget[key].reduce((acc, p) => {
                        if (p === null) {
                            return acc;
                        }
                        if (p === true) {
                            return true;
                        }
                        //p is false
                        if (acc === true) {
                            return true;
                        }
                        return false; // false case, override acc if acc is null
                    }, null);
                }
            }

            // null is used for "all elements" of the tree (root node)
            const rootPermission = permissionsByTreeTarget['nodeId:null'] ?? defaultPermHelper.getDefaultPermission();
            const computedPermissionTree = _computePermissionTree(treeContent, rootPermission, permissionsByTreeTarget);
            const nodesIdsByPermission = _getNodesIdsByPermissionFromTree(computedPermissionTree);
            nodesIdsByPermission[rootPermission].push('null'); // add the null permission info for records not linked to the tree

            result.true = [...result.true, ...nodesIdsByPermission.true];
            result.false = [...result.false, ...nodesIdsByPermission.false];
        }
        //deduplicate each list
        result.true = [...new Set([...result.true])];
        result.false = [...new Set([...result.false])];

        return result;
    };
    const libProps: ILibrary = await getCoreEntityById('library', library, ctx);
    const treeAttributes = libProps?.permissions_conf?.permissionTreeAttributes || [];

    const result: IGetAccessPermissionsValue[] = [];

    for (const treeAttribute of treeAttributes) {
        const attributeProps: IAttribute = await getCoreEntityById('attribute', treeAttribute, ctx);
        const treeId = attributeProps.linked_tree;
        const treeContent = await treeRepo.getTreeContent({treeId, ctx});

        const nodesIdByPermission = await _getNodesIdByPermission(
            treeId,
            treeContent,
            RecordPermissionsActions.ACCESS_RECORD,
        );

        if (!existingFiltersOnTreeIds.includes(treeId)) {
            const nodesIdByPermissionByDefault = await _getNodesIdByPermission(
                treeId,
                treeContent,
                RecordPermissionsActions.ACCESS_RECORD_BY_DEFAULT,
            );

            nodesIdByPermission.true = _.intersection(nodesIdByPermission.true, nodesIdByPermissionByDefault.true);
            nodesIdByPermission.false = _.difference(
                _.union(nodesIdByPermission.false, nodesIdByPermissionByDefault.false),
                nodesIdByPermission.true,
            );
        }

        result.push({
            treeId,
            attribute: attributeProps,
            permissions: nodesIdByPermission,
        });
    }

    return result;
};
export default getAccessPermissionsFilters;
