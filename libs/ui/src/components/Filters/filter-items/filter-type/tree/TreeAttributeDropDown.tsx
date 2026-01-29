// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, type Key, useMemo, useState} from 'react';
import {type IFilterChildrenTreeDropDownProps} from '../_types';
import styled from 'styled-components';
import {KitDivider, KitLoader, KitSpace, KitTree, KitTypography} from 'aristid-ds';
import {type EventDataNode} from 'antd/lib/tree';
import {type ITreeNode, useGetTreeData} from './useGetTreeData';
import {ErrorDisplay} from '_ui/components/ErrorDisplay';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useTreesSearch} from './useTreesSearch';
import {useFiltersContext} from '_ui/components/Filters/useFiltersContext';
import {EmptyValueCheckbox} from '../../EmptyValueCheckbox';
import {SelectAllCheckbox} from '../../SelectAllCheckbox';
import {buildFlattenTree} from './utils/buildFlattenTreeMap';
import {getSelectAllState} from './utils/getSelectAllState';
import {filterTreeByPermission} from './utils/filterTreeByPermission';

const ScrollableContent = styled.div`
    max-height: 182px; /* Equal to 5.5 nodes of KitTree */
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
`;

const FilteredTreeTitle = styled(KitTypography.Text)`
    color: var(--general-colors-neutral-grey-500);
`;

const FilteredTreeSpacer = styled(KitSpace)`
    width: 100%;
`;

const DropdownContentWrapper = styled(KitSpace)`
    width: 327px;
`;

export const TreeAttributeDropDown: FunctionComponent<IFilterChildrenTreeDropDownProps> = ({
    filter,
    onFilterChange,
}) => {
    const {t} = useSharedTranslation();
    const {filtersData} = useFiltersContext();
    const {treeData, isLoading, error} = useGetTreeData({
        treeId: filter.attribute.linkedTree?.id ?? '',
        attributeId: filter.attribute.id,
        libraryId: filtersData.libraryId,
    });

    // Split treeData based on accessRecordByDefaultPermission
    const visibleByDefaultTree = useMemo(() => filterTreeByPermission(treeData, true), [treeData]);
    const hiddenByDefaultTree = useMemo(() => filterTreeByPermission(treeData, false), [treeData]);

    const {filteredVisibleByDefaultTree, filteredHiddenByDefaultTree, expandedNodeIdsFromSearch, SearchInput} =
        useTreesSearch(visibleByDefaultTree, hiddenByDefaultTree);

    const [expandedNodeIdsFromUser, setExpandedNodeIdsFromUser] = useState<Key[]>([]);

    const selectedNodesIds = (filter.nodes ?? []).map(node => node.nodeId);
    const areBothTreesFilled = visibleByDefaultTree.length > 0 && hiddenByDefaultTree.length > 0;

    // Build flatten trees to optimize the search and selection of nodes in handling functions
    const flattenTreeData = useMemo(() => buildFlattenTree(treeData), [treeData]);
    const flattenVisibleByDefaultTree = useMemo(() => buildFlattenTree(visibleByDefaultTree), [visibleByDefaultTree]);
    const flattenHiddenByDefaultTree = useMemo(() => buildFlattenTree(hiddenByDefaultTree), [hiddenByDefaultTree]);

    const _handleOnSelectEmptyValue = (selected: boolean) => {
        onFilterChange({
            ...filter,
            withEmptyValues: selected,
        });
    };

    const _handleOnSelect = (node: ITreeNode, selected: boolean) => {
        let newSelectedIds: string[];

        if (selected) {
            newSelectedIds = [...selectedNodesIds, node.id];
        } else {
            newSelectedIds = selectedNodesIds.filter(selectedValue => selectedValue !== node.id);
        }

        const selectedNodes = newSelectedIds
            .map(nodeId => flattenTreeData.get(nodeId))
            .filter((selectedNode): selectedNode is ITreeNode => Boolean(selectedNode));

        onFilterChange({
            ...filter,
            nodes: selectedNodes.map(selectedNode => ({nodeId: selectedNode.id, libraryId: selectedNode.libraryId})),
            value: selectedNodes.map(selectedNode => selectedNode.recordId),
            formattedValue: selectedNodes.map(selectedNode => selectedNode.title),
        });
    };

    const _handleOnSelectAll = (treeToSelect: Map<string, ITreeNode>, isSelected: boolean) => {
        const treeNodeIds = Array.from(treeToSelect.keys());

        // Using Set to avoid duplicates
        const newSelectedIds = isSelected
            ? [...new Set([...selectedNodesIds, ...treeNodeIds])]
            : selectedNodesIds.filter(id => !treeNodeIds.includes(id));

        const selectedNodes = newSelectedIds
            .map(nodeId => flattenTreeData.get(nodeId))
            .filter((selectedNode): selectedNode is ITreeNode => Boolean(selectedNode));

        onFilterChange({
            ...filter,
            nodes: selectedNodes.map(selectedNode => ({
                nodeId: selectedNode.id,
                libraryId: selectedNode.libraryId,
            })),
            value: selectedNodes.map(selectedNode => selectedNode.recordId),
            formattedValue: selectedNodes.map(selectedNode => selectedNode.title),
        });
    };

    const _handleOnSelectAllVisibleByDefault = (isSelected: boolean) =>
        _handleOnSelectAll(flattenVisibleByDefaultTree, isSelected);

    const _handleOnSelectAllHiddenByDefault = (isSelected: boolean) =>
        _handleOnSelectAll(flattenHiddenByDefaultTree, isSelected);

    const {allSelected: allVisibleSelected, indeterminate: visibleIndeterminate} = getSelectAllState(
        selectedNodesIds,
        flattenVisibleByDefaultTree,
    );

    const {allSelected: allHiddenSelected, indeterminate: hiddenIndeterminate} = getSelectAllState(
        selectedNodesIds,
        flattenHiddenByDefaultTree,
    );

    const treeCommonProps: ComponentProps<typeof KitTree> = {
        selectedKeys: selectedNodesIds,
        checkedKeys: selectedNodesIds,
        defaultExpandedKeys: selectedNodesIds,
        expandedKeys: [...selectedNodesIds, ...expandedNodeIdsFromUser, ...expandedNodeIdsFromSearch],
        autoExpandParent: true,
        checkable: true,
        checkStrictly: true,
        multiple: true,
        onExpand: expandedKeys => {
            setExpandedNodeIdsFromUser(expandedKeys);
        },
        onCheck: (_, info) => {
            const node = info.node as EventDataNode<ITreeNode>;
            _handleOnSelect(node, info.checked);
        },
        onSelect: (_, info) => {
            const node = info.node as EventDataNode<ITreeNode>;
            _handleOnSelect(node, info.selected);
        },
    };

    if (isLoading) {
        return <KitLoader />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    return (
        <DropdownContentWrapper direction="vertical" size="xs">
            {SearchInput}
            {areBothTreesFilled ? (
                <>
                    <EmptyValueCheckbox onSelect={_handleOnSelectEmptyValue} filter={filter} />
                    <FilteredTreeSpacer direction="vertical" size="xxs">
                        <FilteredTreeTitle size="fontSize5" weight="medium">
                            {t('filters.visible-by-default')}
                        </FilteredTreeTitle>
                        <ScrollableContent>
                            <SelectAllCheckbox
                                checked={allVisibleSelected}
                                indeterminate={visibleIndeterminate}
                                onChange={_handleOnSelectAllVisibleByDefault}
                            />
                            <KitTree treeData={filteredVisibleByDefaultTree} {...treeCommonProps} />
                        </ScrollableContent>
                    </FilteredTreeSpacer>
                    <KitDivider noMargin />
                    <FilteredTreeSpacer direction="vertical" size="xxs">
                        <FilteredTreeTitle size="fontSize5" weight="medium">
                            {t('filters.hidden-by-default')}
                        </FilteredTreeTitle>
                        <ScrollableContent>
                            <SelectAllCheckbox
                                checked={allHiddenSelected}
                                indeterminate={hiddenIndeterminate}
                                onChange={_handleOnSelectAllHiddenByDefault}
                            />
                            <KitTree treeData={filteredHiddenByDefaultTree} {...treeCommonProps} />
                        </ScrollableContent>
                    </FilteredTreeSpacer>
                </>
            ) : (
                <ScrollableContent>
                    <EmptyValueCheckbox onSelect={_handleOnSelectEmptyValue} filter={filter} />
                    <SelectAllCheckbox
                        checked={visibleByDefaultTree.length > 0 ? allVisibleSelected : allHiddenSelected}
                        indeterminate={visibleByDefaultTree.length > 0 ? visibleIndeterminate : hiddenIndeterminate}
                        onChange={
                            visibleByDefaultTree.length > 0
                                ? _handleOnSelectAllVisibleByDefault
                                : _handleOnSelectAllHiddenByDefault
                        }
                    />
                    <KitTree
                        treeData={
                            visibleByDefaultTree.length > 0 ? filteredVisibleByDefaultTree : filteredHiddenByDefaultTree
                        }
                        {...treeCommonProps}
                    />
                </ScrollableContent>
            )}
        </DropdownContentWrapper>
    );
};
