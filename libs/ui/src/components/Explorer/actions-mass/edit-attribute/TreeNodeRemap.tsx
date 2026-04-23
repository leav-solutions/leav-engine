// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps} from 'react';
import styled from 'styled-components';
import {KitIdCard, KitSelect, KitTypography} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type MassEditTreeNode, type SetAttributeMapping} from './_types';

const DivContainer = styled.div`
    display: grid;
    align-items: center;
    grid-template-columns: repeat(3, 1fr);
    grid-column-gap: calc(var(--general-spacing-l) * 1px);
`;

const UNDEFINED_VALUE = '__null__';
const DEFAULT_ID_CARD_COLOR = 'rgba(200, 200, 200, 1)';

export const TreeNodeRemap = ({
    currentNode,
    occurrenceCount,
    candidateNodes,
    setAttributeMapping,
}: {
    currentNode: MassEditTreeNode;
    occurrenceCount: number;
    candidateNodes: MassEditTreeNode[];
    setAttributeMapping: SetAttributeMapping;
}) => {
    const {t} = useSharedTranslation();

    const selectOptions: ComponentProps<typeof KitSelect>['options'] = candidateNodes.map(node => ({
        label: node.label,
        value: node.id ?? UNDEFINED_VALUE,
    }));

    const doNotChangeOption = selectOptions[0];

    return (
        <DivContainer>
            <KitIdCard title={currentNode.label} color={currentNode.color ?? DEFAULT_ID_CARD_COLOR} />
            <KitTypography.Text>
                {t('explorer.massAction.editAttribute_value_occurrences_to_edit', {
                    count: occurrenceCount,
                })}
            </KitTypography.Text>
            <KitSelect
                defaultValue={doNotChangeOption.value}
                options={selectOptions}
                size="middle"
                allowClear={false}
                onChange={value => {
                    setAttributeMapping({
                        before: currentNode.id,
                        after: value === UNDEFINED_VALUE ? null : value,
                        occurrenceCount,
                    });
                }}
            />
        </DivContainer>
    );
};
