import {ErrorDisplay} from '_ui/components/ErrorDisplay';
import {useFiltersContext} from '_ui/components/Filters/useFiltersContext';
import {KitLoader, KitSpace, KitTree} from 'aristid-ds';
import {type ISmartFilterNode, useGetSmartFilterData} from './useGetSmartFilterData';
import {useSmartFilterSearch} from './useSmartFilerSearch';
import styled from 'styled-components';
import {type EventDataNode} from 'antd/es/tree';
import {type IFilterChildrenSmartFilterDropDownProps} from '../_types';
import {SelectAllCheckbox} from '../../shared/SelectAllCheckbox';
import {EmptyValueCheckbox} from '../../shared/EmptyValueCheckbox';
import {FilterTreeNodeTitle} from '../../shared/FilterTreeNodeTitle';

const DropdownContentWrapper = styled(KitSpace)`
    width: 327px;
    justify-content: center;
`;

const ScrollableContent = styled.div`
    max-height: 182px; /* Equal to 5.5 nodes of KitTree */
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
`;

const KitTreeWithGhostedNodes = styled(KitTree)`
    & .ant-tree-treenode:has(div[data-ghosted='true']) {
        & > span {
            background-color: var(--general-utilities-neutral-light) !important;

            .ant-tree-checkbox-inner {
                background-color: var(--general-utilities-neutral-dark) !important;
                border-color: var(--general-utilities-neutral-dark) !important;
            }

            .ant-typography {
                font-style: italic;
            }
        }
    }
`;

export const SmartFilterAttributeDropdown = ({filter, onFilterChange}: IFilterChildrenSmartFilterDropDownProps) => {
    const {filtersData} = useFiltersContext();

    const selectedNodesIds = [...(filter.value ?? [])];

    const {smartFilterDataToDisplay, noValueNodeData, isLoading, error} = useGetSmartFilterData({
        libraryId: filtersData.libraryId,
        attributeId: filter.attribute.id,
        filters: filtersData.filters,
        filtersOperator: filtersData.filtersOperator,
        selectedValueIds: selectedNodesIds,
        selectedFormattedValues: filter.formattedValue,
    });

    const {filteredSmartFilterData, SearchInput} = useSmartFilterSearch(smartFilterDataToDisplay);

    const isFullyChecked =
        selectedNodesIds.length > 0 &&
        selectedNodesIds.length === smartFilterDataToDisplay.length &&
        filter.withEmptyValues;
    const hasAnySelection = selectedNodesIds.length > 0 || filter.withEmptyValues;

    const _handleOnSelect = (node: ISmartFilterNode, selected: boolean) => {
        let newSelectedIds: string[];

        if (selected) {
            newSelectedIds = [...selectedNodesIds, node.key];
        } else {
            newSelectedIds = selectedNodesIds.filter(selectedValue => selectedValue !== node.key);
        }

        const selectedNodes = newSelectedIds
            .map(nodeKey => filteredSmartFilterData.find(smartFilterNode => smartFilterNode.key === nodeKey))
            .filter((selectedNode): selectedNode is ISmartFilterNode => Boolean(selectedNode));

        onFilterChange({
            ...filter,
            value: selectedNodes.map(selectedNode => selectedNode.value),
            formattedValue: selectedNodes.map(selectedNode => selectedNode.title),
        });
    };

    const _handleOnSelectAll = (isSelected: boolean) => {
        const selectedNodes = isSelected ? [...smartFilterDataToDisplay] : [];

        onFilterChange({
            ...filter,
            value: selectedNodes.map(selectedNode => selectedNode.value),
            formattedValue: selectedNodes.map(selectedNode => selectedNode.title),
            withEmptyValues: isSelected,
        });
    };

    const _handleOnSelectEmptyValue = (selected: boolean) => {
        onFilterChange({
            ...filter,
            withEmptyValues: selected,
        });
    };

    if (isLoading) {
        return (
            <DropdownContentWrapper align="center">
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
                <SelectAllCheckbox
                    checked={isFullyChecked}
                    indeterminate={hasAnySelection && !isFullyChecked}
                    onChange={_handleOnSelectAll}
                />
                <EmptyValueCheckbox
                    filter={filter}
                    onSelect={_handleOnSelectEmptyValue}
                    count={noValueNodeData?.count ?? 0}
                />
                <KitTreeWithGhostedNodes
                    treeData={filteredSmartFilterData}
                    selectedKeys={selectedNodesIds}
                    checkedKeys={selectedNodesIds}
                    checkable={true}
                    checkStrictly={true}
                    multiple={true}
                    titleRender={kitTreeNode => {
                        const node = kitTreeNode as EventDataNode<ISmartFilterNode>;
                        return (
                            <FilterTreeNodeTitle title={node.title} count={node.count ?? 0} ghosted={node.ghosted} />
                        );
                    }}
                    onCheck={(_, info) => {
                        const node = info.node as EventDataNode<ISmartFilterNode>;
                        _handleOnSelect(node, info.checked);
                    }}
                    onSelect={(_, info) => {
                        const node = info.node as EventDataNode<ISmartFilterNode>;
                        _handleOnSelect(node, info.selected);
                    }}
                />
            </ScrollableContent>
        </DropdownContentWrapper>
    );
};
