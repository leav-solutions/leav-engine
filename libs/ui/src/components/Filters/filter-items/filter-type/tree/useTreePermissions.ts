// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMemo} from 'react';
import {type ITreeNode} from './useGetTreeData';
import {buildFlattenTree} from './utils/buildFlattenTreeMap';
import {filterTreeByPermission} from './utils/filterTreeByPermission';

const markDisabledParents = (nodes: ITreeNode[]): ITreeNode[] =>
    nodes.map(node => ({
        ...node,
        disableCheckbox: node.accessRecordByDefaultPermission === false,
        children: markDisabledParents(node.children),
    }));

export interface ITreePermissions {
    displayTree: ITreeNode[];
    flattenTreeData: Map<string, ITreeNode>;
    flattenForSelectAll: Map<string, ITreeNode>;
    isAccessPermissionConfigured: boolean;
}

export const useTreePermissions = (treeData: ITreeNode[], includeHiddenOptions: boolean): ITreePermissions => {
    // visibleOnlyTree: nodes with accessRecordByDefaultPermission === true,
    // plus structural parents (=== false or undefined) that have === true descendants.
    const visibleOnlyTree = useMemo(() => filterTreeByPermission(treeData), [treeData]);

    const visibleOnlyTreeWithDisabledParents = useMemo(() => markDisabledParents(visibleOnlyTree), [visibleOnlyTree]);

    const flattenTreeData = useMemo(() => buildFlattenTree(treeData), [treeData]);

    // Only === true nodes are selectable; other are excluded.
    const flattenSelectableVisibleTree = useMemo(() => {
        const map = buildFlattenTree(visibleOnlyTree);
        map.forEach((node, id) => {
            if (!node.accessRecordByDefaultPermission) {
                map.delete(id);
            }
        });
        return map;
    }, [visibleOnlyTree]);

    // Active only when at least one node is explicitly visible (=== true).
    // When all permissions are undefined, the feature is inactive and the full tree is shown.
    const isAccessPermissionConfigured = useMemo(
        () => Array.from(flattenTreeData.values()).some(node => node.accessRecordByDefaultPermission === true),
        [flattenTreeData],
    );

    const displayTree =
        isAccessPermissionConfigured && !includeHiddenOptions ? visibleOnlyTreeWithDisabledParents : treeData;

    const flattenForSelectAll =
        isAccessPermissionConfigured && !includeHiddenOptions ? flattenSelectableVisibleTree : flattenTreeData;

    return {
        displayTree,
        flattenTreeData,
        flattenForSelectAll,
        isAccessPermissionConfigured,
    };
};
