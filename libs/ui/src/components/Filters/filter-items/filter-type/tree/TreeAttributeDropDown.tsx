// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, type Key, useEffect, useState} from 'react';
import {type IFilterChildrenTreeDropDownProps} from '../_types';
import styled from 'styled-components';
import {KitLoader, KitSpace, KitTree} from 'aristid-ds';
import {type EventDataNode} from 'antd/lib/tree';
import {type ITreeNode, useGetTreeData} from './useGetTreeData';
import {ErrorDisplay} from '_ui/components/ErrorDisplay';
import {useTreesSearch} from './useTreesSearch';
import {useFiltersContext} from '_ui/components/Filters/useFiltersContext';
import {EmptyValueCheckbox} from '../../shared/EmptyValueCheckbox';
import {SelectAllCheckbox} from '../../shared/SelectAllCheckbox';
import {countSelectedTreeChildren} from './utils/countSelectedTreeChildren';
import {FilterTreeNodeTitle} from '../../shared/FilterTreeNodeTitle';
import {useTreePermissions} from './useTreePermissions';
import {useTreeNodeSelection} from './useTreeNodeSelection';

const ScrollableContent = styled.div`
    max-height: 348px; /* Equal to 10.5 nodes of KitTree */
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
`;

const DropdownContentWrapper = styled(KitSpace)`
    width: 327px;
    justify-content: center;
`;

// Applies ghosted styling to tree nodes that have data-ghosted="true" on their title wrapper.
// Used to visually distinguish hidden-by-default nodes when the toggle is active.
const StyledKitTreeWithGhostedNodes = styled(KitTree)`
    & .ant-tree-treenode:has(div[data-ghosted='true']) {
        .ant-typography {
            color: var(--general-colors-neutral-grey-500);
            font-style: italic;
        }
    }

    & .ant-tree-treenode:has(.ant-tree-checkbox-disabled) {
        .ant-tree-node-content-wrapper,
        .ant-typography {
            cursor: default;
        }
    }
`;

export const TreeAttributeDropDown: FunctionComponent<IFilterChildrenTreeDropDownProps> = ({
    filter,
    onFilterChange,
    toggleHiddenRef,
    onPermissionConfiguredChange,
}) => {
    const {filtersData} = useFiltersContext();

    const {treeData, isLoading, error} = useGetTreeData({
        treeId: filter.attribute.linkedTree?.id ?? '',
        attributeId: filter.attribute.id,
        libraryId: filtersData.libraryId,
    });

    const includeHiddenOptions = filter.includeHiddenOptions ?? false;

    const {displayTree, flattenTreeData, flattenForSelectAll, isAccessPermissionConfigured} = useTreePermissions(
        treeData,
        includeHiddenOptions,
    );

    const {selectedNodesIds, allSelected, indeterminate, handleOnSelectEmptyValue, handleOnSelect, handleOnSelectAll} =
        useTreeNodeSelection({
            filter,
            onFilterChange,
            flattenTreeData,
            flattenForSelectAll,
            isAccessPermissionConfigured,
            toggleHiddenRef,
        });

    const {filteredTree, expandedNodeIdsFromSearch, SearchInput} = useTreesSearch(displayTree);

    const [expandedNodeIdsFromUser, setExpandedNodeIdsFromUser] = useState<Key[]>([]);

    useEffect(() => {
        onPermissionConfiguredChange?.(isAccessPermissionConfigured);
    }, [isAccessPermissionConfigured, onPermissionConfiguredChange]);

    const treeCommonProps: ComponentProps<typeof StyledKitTreeWithGhostedNodes> = {
        selectedKeys: selectedNodesIds,
        checkedKeys: selectedNodesIds,
        defaultExpandedKeys: selectedNodesIds,
        expandedKeys: [...expandedNodeIdsFromUser, ...expandedNodeIdsFromSearch],
        checkable: true,
        checkStrictly: true,
        multiple: true,
        titleRender(node) {
            const nodeData = node as EventDataNode<ITreeNode>;

            // TODO: countSelectedTreeChildren is computed here because the tree may contain
            // disabled-checkbox parents whose children are in a different permission group.
            // This ensures the count reflects the actual selected descendants regardless of splitting.
            const selectedChildrenCount = countSelectedTreeChildren(nodeData, selectedNodesIds);
            const isHiddenByDefault =
                isAccessPermissionConfigured &&
                (includeHiddenOptions
                    ? nodeData.accessRecordByDefaultPermission === false
                    : nodeData.accessRecordByDefaultPermission !== true);

            return (
                <FilterTreeNodeTitle
                    title={nodeData.title}
                    count={selectedChildrenCount > 0 ? selectedChildrenCount : undefined}
                    ghosted={isHiddenByDefault}
                />
            );
        },
        onExpand: expandedKeys => {
            setExpandedNodeIdsFromUser(expandedKeys);
        },
        onCheck: (_, info) => {
            const node = info.node as EventDataNode<ITreeNode>;
            handleOnSelect(node, info.checked);
        },
        onSelect: (_, info) => {
            const node = info.node as EventDataNode<ITreeNode>;
            if (node.disableCheckbox) {
                return;
            }
            handleOnSelect(node, info.selected);
        },
    };

    if (isLoading) {
        return (
            <DropdownContentWrapper>
                <KitLoader />
            </DropdownContentWrapper>
        );
    }

    if (error) {
        return (
            <DropdownContentWrapper>
                <ErrorDisplay message={error.message} />
            </DropdownContentWrapper>
        );
    }

    return (
        <DropdownContentWrapper direction="vertical" size="xs">
            {SearchInput}
            <ScrollableContent>
                <EmptyValueCheckbox onSelect={handleOnSelectEmptyValue} filter={filter} />
                <SelectAllCheckbox
                    checked={allSelected}
                    indeterminate={indeterminate}
                    onChange={checked => handleOnSelectAll(flattenForSelectAll, checked)}
                />
                <StyledKitTreeWithGhostedNodes treeData={filteredTree} {...treeCommonProps} />
            </ScrollableContent>
        </DropdownContentWrapper>
    );
};
