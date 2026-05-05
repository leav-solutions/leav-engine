// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type MutableRefObject} from 'react';
import {type IUIFilterTree} from '_ui/components/Filters/_types';
import {type ITreeNode} from './useGetTreeData';
import {getSelectAllState} from './utils/getSelectAllState';

interface IUseTreeNodeSelectionParams {
    filter: IUIFilterTree;
    onFilterChange: (filterData: IUIFilterTree) => void;
    flattenTreeData: Map<string, ITreeNode>;
    flattenForSelectAll: Map<string, ITreeNode>;
    isAccessPermissionConfigured: boolean;
    toggleHiddenRef?: MutableRefObject<((checked: boolean) => void) | null>;
}

export interface ITreeNodeSelection {
    selectedNodesIds: string[];
    allSelected: boolean;
    indeterminate: boolean;
    handleOnSelectEmptyValue: (selected: boolean) => void;
    handleOnSelect: (node: ITreeNode, selected: boolean) => void;
    handleOnSelectAll: (treeToSelect: Map<string, ITreeNode>, isSelected: boolean) => void;
}

export const useTreeNodeSelection = ({
    filter,
    onFilterChange,
    flattenTreeData,
    flattenForSelectAll,
    isAccessPermissionConfigured,
    toggleHiddenRef,
}: IUseTreeNodeSelectionParams): ITreeNodeSelection => {
    const selectedNodesIds = (filter.userNodes ?? []).map(node => node.nodeId);

    const {allSelected, indeterminate} = getSelectAllState(selectedNodesIds, flattenForSelectAll);

    const handleOnSelectEmptyValue = (selected: boolean) => {
        onFilterChange({...filter, withEmptyValues: selected});
    };

    const handleOnSelect = (node: ITreeNode, selected: boolean) => {
        const newSelectedIds = selected
            ? [...selectedNodesIds, node.id]
            : selectedNodesIds.filter(id => id !== node.id);

        const selectedNodes = newSelectedIds
            .map(nodeId => flattenTreeData.get(nodeId))
            .filter((n): n is ITreeNode => Boolean(n));

        const mappedNodes = selectedNodes.map(n => ({nodeId: n.id, libraryId: n.libraryId}));
        onFilterChange({
            ...filter,
            nodes: mappedNodes,
            value: selectedNodes.map(n => n.recordId),
            userNodes: mappedNodes,
            userFormattedValue: selectedNodes.map(n => n.title),
        });
    };

    const handleOnSelectAll = (treeToSelect: Map<string, ITreeNode>, isSelected: boolean) => {
        const newSelectedIds = isSelected
            ? [...new Set([...selectedNodesIds, ...treeToSelect.keys()])]
            : selectedNodesIds.filter(id => !treeToSelect.has(id));

        const selectedNodes = newSelectedIds
            .map(nodeId => flattenTreeData.get(nodeId))
            .filter((n): n is ITreeNode => Boolean(n));

        const mappedNodes = selectedNodes.map(n => ({nodeId: n.id, libraryId: n.libraryId}));
        onFilterChange({
            ...filter,
            nodes: mappedNodes,
            value: selectedNodes.map(n => n.recordId),
            userNodes: mappedNodes,
            userFormattedValue: selectedNodes.map(n => n.title),
        });
    };

    const handleToggle = (checked: boolean) => {
        if (filter.userNodes != null) {
            // Has user selection: on toggle off, drop hidden selections from user selection.
            if (!checked) {
                const keptNodes = filter.userNodes
                    .map(n => flattenTreeData.get(n.nodeId))
                    .filter(
                        (node): node is ITreeNode =>
                            node !== undefined && node.accessRecordByDefaultPermission !== false,
                    );
                const hasKept = keptNodes.length > 0;
                const mappedKept = hasKept ? keptNodes.map(n => ({nodeId: n.id, libraryId: n.libraryId})) : null;
                onFilterChange({
                    ...filter,
                    includeHiddenOptions: false,
                    nodes: mappedKept,
                    value: hasKept ? keptNodes.map(n => n.recordId) : null,
                    userNodes: mappedKept,
                    userFormattedValue: hasKept ? keptNodes.map(n => n.title) : null,
                });
            } else {
                onFilterChange({...filter, includeHiddenOptions: true});
            }
        } else {
            // No user selection: update the network values (value/nodes) to reflect all currently
            // visible nodes, without creating a UI selection (userNodes stays null).
            // Toggle ON  → all nodes (flattenTreeData contains hidden nodes too).
            // Toggle OFF → only nodes with explicit access (accessRecordByDefaultPermission === true).
            const networkNodes = checked
                ? [...flattenTreeData.values()]
                : [...flattenTreeData.values()].filter(node => node.accessRecordByDefaultPermission === true);
            onFilterChange({
                ...filter,
                includeHiddenOptions: checked,
                nodes: networkNodes.map(n => ({nodeId: n.id, libraryId: n.libraryId})),
                value: networkNodes.map(n => n.recordId),
                formattedValue: networkNodes.map(n => n.title),
            });
        }
    };

    // Expose the toggle handler to FilterDropDown via ref (updated every render to stay current)
    if (toggleHiddenRef) {
        toggleHiddenRef.current = isAccessPermissionConfigured ? handleToggle : null;
    }

    return {selectedNodesIds, allSelected, indeterminate, handleOnSelectEmptyValue, handleOnSelect, handleOnSelectAll};
};
