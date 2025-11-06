// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, useEffect, useState} from 'react';
import {KitSelect} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {AttributeConditionFilter, type IRecordIdentity, type ITreeNodeWithRecord} from '_ui/types';
import {RecordFilterCondition} from '_ui/_gqlTypes';
import {type IFilterChildrenTreeDropDownProps} from './_types';
import {SelectTreeNode} from '_ui/components/SelectTreeNode';
import styled from 'styled-components';
import {useConditionsOptionsByType} from './useConditionOptionsByType';

const DivStyled = styled.div`
    max-height: 30rem;
    overflow: auto;
`;

export const TreeAttributeDropDown: FunctionComponent<IFilterChildrenTreeDropDownProps> = ({
    filter,
    onFilterChange,
    selectDropDownRef,
}) => {
    const {t} = useSharedTranslation();

    const [selectedNodes, setSelectedNodes] = useState<ITreeNodeWithRecord[]>([]);

    const {conditionOptionsByType: availableConditionsOptions} = useConditionsOptionsByType(filter);

    const _handleOnSelect = (node: ITreeNodeWithRecord, selected: boolean) => {
        if (selected) {
            setSelectedNodes(prev => [...prev, node]);
        } else {
            setSelectedNodes(prev => prev.filter(selectedValue => selectedValue.id !== node.id));
        }
    };

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition => {
        onFilterChange({...filter, condition});
    };

    useEffect(() => {
        if (filter.value == null) {
            setSelectedNodes([]);
        }
    }, [filter]);

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
        setSelectedNodes(selection.filter(node => !node?.disabled));

        const records = _getRecursiveChildrenRecord(selection);
        const fields = _getRecursiveFieldsFromLibraries(selection);

        onFilterChange({
            ...filter,
            value: records.map(record => record.id),
            formattedValue: records.map(record => record.whoAmI.label).filter(Boolean),
            condition: filter.condition ?? RecordFilterCondition.EQUAL,
            field: fields,
        });
    };

    const showSearch =
        filter.condition &&
        ![AttributeConditionFilter.IS_EMPTY, AttributeConditionFilter.IS_NOT_EMPTY].includes(filter.condition);

    return (
        <DivStyled>
            <KitSelect
                options={availableConditionsOptions}
                onChange={_onConditionChanged}
                value={filter.condition}
                getPopupContainer={() => selectDropDownRef?.current ?? document.body}
                aria-label={String(t('explorer.filter-link-condition'))}
            />
            {showSearch && (
                <SelectTreeNode
                    treeId={filter.attribute.linkedTree?.id ?? ''}
                    selectedNodes={selectedNodes.map(node => node.id)}
                    onSelect={_handleOnSelect}
                    onCheck={_handleOnCheck}
                    multiple
                    canSelectRoot
                    checkStrictly={false}
                    checkable
                    loadRecursively={true}
                    noPagination={true}
                />
            )}
        </DivStyled>
    );
};
