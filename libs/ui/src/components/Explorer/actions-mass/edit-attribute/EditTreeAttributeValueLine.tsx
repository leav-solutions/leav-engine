// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AttributeDetailsTreeAttributeFragment} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitIdCard, KitSelect, KitTypography} from 'aristid-ds';
import {type FunctionComponent} from 'react';
import styled from 'styled-components';
import {type ITreeAttributeNodeValue} from './useListTreeAttributeValuesHook';

const DivContainer = styled.div`
    display: grid;
    align-items: center;
    grid-template-columns: repeat(3, 1fr);
    grid-column-gap: calc(var(--general-spacing-l) * 1px);
`;

const UNDEFINED_VALUE = '__null__';
const DEFAULT_ID_CARD_COLOR = 'rgba(200, 200, 200, 1)';

export const EditTreeAttributeValueLine: FunctionComponent<{
    treeNodeValues: ITreeAttributeNodeValue[];
    valueOccurrenceNodeId: string | null;
    valueOccurrenceCount: number;
    setAttributeMapping: (before: string | null, after: string | null) => void;
}> = ({treeNodeValues, valueOccurrenceNodeId, valueOccurrenceCount, setAttributeMapping}) => {
    const {t} = useSharedTranslation();

    const treeNodeValueOfOccurrence = treeNodeValues.find(node => node.id === valueOccurrenceNodeId);
    if (!treeNodeValueOfOccurrence) {
        return null;
    }

    const allowedDependentValues = treeNodeValueOfOccurrence ? treeNodeValueOfOccurrence.allowedDependentValues : null;

    const selectOptions = treeNodeValues
        .filter(treeNode => treeNode.id !== valueOccurrenceNodeId)
        .filter(
            treeNode =>
                allowedDependentValues == null || // if no allowedDependentValues, all values are allowed
                !!allowedDependentValues.find(dv => dv.nodeId === treeNode.id),
        )
        .map(treeNode => ({
            label: treeNode.label,
            value: treeNode.id || UNDEFINED_VALUE,
        }));

    if (selectOptions.length === 0 && valueOccurrenceNodeId) {
        selectOptions.push({
            label: t('explorer.massAction.editAttribute_value_do_not_change'),
            value: valueOccurrenceNodeId,
        });
    }

    return (
        <DivContainer>
            <KitIdCard
                title={treeNodeValueOfOccurrence.label}
                color={treeNodeValueOfOccurrence.color || DEFAULT_ID_CARD_COLOR}
            />
            <KitTypography.Text>
                {t('explorer.massAction.editAttribute_value_occurrences_to_edit', {
                    count: valueOccurrenceCount,
                })}
            </KitTypography.Text>
            <KitSelect
                options={selectOptions}
                size="middle"
                allowClear={false}
                placeholder={t('explorer.massAction.editAttribute_value_select_placeholder')}
                onChange={value => {
                    setAttributeMapping(valueOccurrenceNodeId, value === UNDEFINED_VALUE ? null : value || null);
                }}
            />
        </DivContainer>
    );
};
