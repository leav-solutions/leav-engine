// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AttributeDetailsTreeAttributeFragment} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitIdCard, KitSelect, KitTypography} from 'aristid-ds';
import {type FunctionComponent} from 'react';
import styled from 'styled-components';
import {type TreeAttributeNodeValue} from './useListTreeAttributeValuesHook';

const DivContainer = styled.div`
    display: grid;
    align-items: center;
    grid-template-columns: repeat(3, 1fr);
    grid-column-gap: calc(var(--general-spacing-l) * 1px);
`;

const UNDEFINED_VALUE = '__null__';
const DEFAULT_ID_CARD_COLOR = 'rgba(200, 200, 200, 1)';

export const EditTreeAttributeValueLine: FunctionComponent<{
    treeNodeValues: TreeAttributeNodeValue[];
    selectedAttribute: AttributeDetailsTreeAttributeFragment;
    valueOccurrenceNodeId: string | null;
    valueOccurrenceCount: number;
    setAttributeMapping: (before: string | null, after: string | null) => void;
}> = ({selectedAttribute, treeNodeValues, valueOccurrenceNodeId, valueOccurrenceCount, setAttributeMapping}) => {
    const {t} = useSharedTranslation();

    const treeNodeValueOfOccurrence = valueOccurrenceNodeId
        ? treeNodeValues.find(node => node.id === valueOccurrenceNodeId)
        : null;

    const selectOptions = treeNodeValues
        .filter(treeNode => treeNode.id !== valueOccurrenceNodeId)
        .map(treeNode => ({
            label: treeNode.record.whoAmI.label || treeNode.record.whoAmI.id,
            value: treeNode.id,
        }))
        .concat(
            selectedAttribute.required || !treeNodeValueOfOccurrence
                ? []
                : [
                      {
                          label: t('explorer.massAction.editAttribute_value_undefined'),
                          value: UNDEFINED_VALUE,
                      },
                  ],
        );

    return (
        <DivContainer>
            {treeNodeValueOfOccurrence ? (
                <KitIdCard
                    title={treeNodeValueOfOccurrence.record.whoAmI.label}
                    color={treeNodeValueOfOccurrence.record.whoAmI.color || DEFAULT_ID_CARD_COLOR}
                />
            ) : (
                <KitIdCard
                    title={t('explorer.massAction.editAttribute_value_undefined')}
                    color={DEFAULT_ID_CARD_COLOR}
                />
            )}
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
