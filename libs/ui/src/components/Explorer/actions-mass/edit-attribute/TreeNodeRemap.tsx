import {type ComponentProps} from 'react';
import styled from 'styled-components';
import {KitIdCard, KitSelect, KitTypography} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {DO_NOT_CHANGE, type MassEditTargetNode, type MassEditTreeNode, type SetAttributeMapping} from './_types';

const DivContainer = styled.div`
    display: grid;
    align-items: center;
    grid-template-columns: repeat(3, 1fr);
    grid-column-gap: calc(var(--general-spacing-l) * 1px);
`;

const DEFAULT_ID_CARD_COLOR = 'rgba(200, 200, 200, 1)';

export const TreeNodeRemap = ({
    currentNode,
    occurrenceCount,
    candidateNodes,
    setAttributeMapping,
}: {
    currentNode: MassEditTreeNode;
    occurrenceCount: number;
    candidateNodes: MassEditTargetNode[];
    setAttributeMapping: SetAttributeMapping;
}) => {
    const {t} = useSharedTranslation();

    const selectOptions: ComponentProps<typeof KitSelect>['options'] = [
        {label: t('explorer.massAction.editAttribute_value_do_not_change'), value: DO_NOT_CHANGE},
        ...candidateNodes.map(node => ({
            label: node.label,
            value: node.id,
        })),
    ];

    return (
        <DivContainer>
            <KitIdCard title={currentNode.label} color={currentNode.color ?? DEFAULT_ID_CARD_COLOR} />
            <KitTypography.Text>
                {t('explorer.massAction.editAttribute_value_occurrences_to_edit', {
                    count: occurrenceCount,
                })}
            </KitTypography.Text>
            <KitSelect
                defaultValue={DO_NOT_CHANGE}
                options={selectOptions}
                size="middle"
                allowClear={false}
                onChange={value => {
                    setAttributeMapping({
                        before: currentNode.id,
                        after: value,
                        occurrenceCount,
                    });
                }}
            />
        </DivContainer>
    );
};
