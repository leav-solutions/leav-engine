// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {type IRecordIdentity, type ITreeNodeWithRecord} from '_ui/types';
import {RecordFilterCondition} from '_ui/_gqlTypes';
import {type IFilterChildrenTreeDropDownProps} from './_types';
import {SelectTreeNode} from '_ui/components/SelectTreeNode';
import styled from 'styled-components';
import {EmptyValueCheckbox} from '../EmptyValueCheckbox';

const DivStyled = styled.div`
    max-height: 30rem;
    overflow: auto;
`;

export const TreeAttributeDropDown: FunctionComponent<IFilterChildrenTreeDropDownProps> = ({
    filter,
    onFilterChange,
}) => {
    const selectedNodesIds = (filter.nodes ?? []).map(node => node.nodeId);

    const _handleOnCheckEmptyValue = (selected: boolean) => {
        onFilterChange({
            ...filter,
            withEmptyValues: selected,
        });
    };

    const _handleOnSelect = (node: ITreeNodeWithRecord, selected: boolean) => {
        let newSelectedIds: string[];
        if (selected) {
            newSelectedIds = [...selectedNodesIds, node.id];
        } else {
            newSelectedIds = selectedNodesIds.filter(selectedValue => selectedValue !== node.id);
        }
        onFilterChange({
            ...filter,
            nodes: newSelectedIds.map(id => ({nodeId: id, libraryId: node.record.whoAmI.library.id})),
        });
    };

    const _getRecursiveChildrenRecord = (nodes: ITreeNodeWithRecord[]): IRecordIdentity[] => {
        const records: IRecordIdentity[] = [];
        const collectRecordIdsRecursively = (nodeList: ITreeNodeWithRecord[]) => {
            for (const node of nodeList) {
                if (node.id === filter.attribute.linkedTree?.id) {
                    continue;
                }
                if (node.record) {
                    records.push(node.record);
                }
                if (node.children && node.children.length > 0) {
                    collectRecordIdsRecursively(node.children);
                }
            }
        };
        collectRecordIdsRecursively(nodes);
        // Delete duplicates
        return Array.from(new Set(records));
    };
    const _getRecursiveFieldsFromLibraries = (nodes: ITreeNodeWithRecord[]): string[] =>
        nodes
            .filter(node => !!node.record?.whoAmI?.library?.id)
            .map(node => `${filter.attribute.id}.${node.record?.whoAmI?.library?.id}.id`);

    const _handleOnCheck = (selection: ITreeNodeWithRecord[]) => {
        const newSelectedNodes = selection.filter(node => !node?.disabled);

        const records = _getRecursiveChildrenRecord(selection);
        const fields = _getRecursiveFieldsFromLibraries(selection);

        onFilterChange({
            ...filter,
            nodes: newSelectedNodes.map(node => ({
                nodeId: node.id,
                libraryId: node.record?.whoAmI.library.id ?? records[0]?.whoAmI.library.id ?? '',
            })),
            value: records.map(record => record.id),
            formattedValue: records.map(record => record.whoAmI.label).filter(Boolean),
            condition: RecordFilterCondition.EQUAL,
            field: fields,
        });
    };

    return (
        <DivStyled>
            <EmptyValueCheckbox onSelect={_handleOnCheckEmptyValue} filter={filter} />
            <SelectTreeNode
                treeId={filter.attribute.linkedTree?.id ?? ''}
                selectedNodes={selectedNodesIds}
                onSelect={_handleOnSelect}
                onCheck={_handleOnCheck}
                multiple
                canSelectRoot={true}
                checkStrictly={false}
                checkable
                loadRecursively={true}
                noPagination={true}
            />
        </DivStyled>
    );
};
