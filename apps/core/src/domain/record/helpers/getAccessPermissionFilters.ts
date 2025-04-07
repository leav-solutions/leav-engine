// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {IAttribute} from '_types/attribute';
import {ILibrary} from '_types/library';
import {PermissionTypes, RecordPermissionsActions} from '../../../_types/permissions';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeNode} from '_types/tree';
import {GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';

interface IAccessPermissionFilterDeps {
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.infra.tree': ITreeRepo;
    'core.infra.permission': IPermissionRepo;
}

export interface IGetAccesPermissionsValue {
    treeId: string;
    attribute: IAttribute;
    permissions: {
        true: string[];
        false: string[];
    };
}

export type IGetAccesPermissions = (
    groupsIds: string[],
    library: string,
    deps: IAccessPermissionFilterDeps,
    ctx: IQueryInfos
) => Promise<IGetAccesPermissionsValue[]>;

const getAccessPermissionsFilters: IGetAccesPermissions = async (groupsIds, library, deps, ctx) => {
    const {
        'core.domain.helpers.getCoreEntityById': getCoreEntityById,
        'core.infra.tree': treeRepo,
        'core.infra.permission': permissionRepo
    } = deps;

    const _computePermissionTree = (
        treeContent: ITreeNode[],
        parentPermission: boolean,
        permissionsByTreeTarget
    ): any[] => {
        const result = treeContent.map(treeElem => {
            const treeElemWithPermission = {id: treeElem.id, children: [], permission: parentPermission};
            treeElemWithPermission.permission = permissionsByTreeTarget[`nodeId:${treeElem.id}`] ?? parentPermission;
            treeElemWithPermission.children = _computePermissionTree(
                treeElem.children,
                treeElemWithPermission.permission,
                permissionsByTreeTarget
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
    const _getNodesIdByPermission = async (treeId: string): Promise<any> => {
        const treeContent = await treeRepo.getTreeContent({treeId, ctx});

        const permissions = await permissionRepo.getAllPermissionsForTree({
            type: PermissionTypes.RECORD,
            applyTo: library,
            actionKey: RecordPermissionsActions.ACCESS_RECORD,
            treeId,
            ctx
        });
        const permissionsByTreeTarget = permissions.reduce((acc, p) => {
            acc[`nodeId:${p.permissionTreeTarget.nodeId}`] = p.actions[`${RecordPermissionsActions.ACCESS_RECORD}`];
            return acc;
        }, {});
        // null is used for "all elements" of the tree (root node)
        const rootPermission = permissionsByTreeTarget['nodeId:null'] ?? true;
        const computedPermissionTree = _computePermissionTree(treeContent, rootPermission, permissionsByTreeTarget);
        const nodesIdsByPermission = _getNodesIdsByPermissionFromTree(computedPermissionTree);
        nodesIdsByPermission[rootPermission].push('null'); // add the null permission info for records not linked to the tree
        return nodesIdsByPermission;
    };
    const libProps: ILibrary = await getCoreEntityById('library', library, ctx);
    const treeAttributes = libProps?.permissions_conf?.permissionTreeAttributes || [];

    const result: IGetAccesPermissionsValue[] = [];

    for (const treeAttribute of treeAttributes) {
        const attributeProps: IAttribute = await getCoreEntityById('attribute', treeAttribute, ctx);
        const treeId = attributeProps.linked_tree;

        const nodesIdByPermission = await _getNodesIdByPermission(treeId);

        result.push({
            treeId,
            attribute: attributeProps,
            permissions: nodesIdByPermission
        });
    }

    return result;
};
export default getAccessPermissionsFilters;
