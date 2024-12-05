// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent} from 'react';
import styled from 'styled-components';
import {FaGripLines} from 'react-icons/fa';
import {KitButton, KitFilter} from 'aristid-ds';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

const StyledFilterListItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;

    div {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: calc(var(--general-spacing-xs) * 1px);
    }
`;

const StyledDragHandle = styled.span<{$isDragging: boolean}>`
    display: flex;
    align-items: center;
    cursor: ${props => (props.$isDragging ? 'grabbing' : 'grab')};
`;

interface IActiveFilterListItemProps {
    attributeId: string;
    isDraggable?: true;
    filterChipProps: Pick<
        ComponentProps<typeof KitFilter>,
        'label' | 'values' | 'expandable' | 'dropDownProps' | 'disabled'
    >;
    visibilityButtonProps?: Pick<ComponentProps<typeof KitButton>, 'onClick' | 'icon' | 'title'>;
}

export const FilterListItem: FunctionComponent<IActiveFilterListItemProps> = ({
    attributeId,
    isDraggable,
    visibilityButtonProps,
    filterChipProps
}) => {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: attributeId});
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <StyledFilterListItem ref={setNodeRef} style={style}>
            <div>
                {isDraggable && (
                    <StyledDragHandle {...attributes} {...listeners} $isDragging={isDragging}>
                        <FaGripLines />
                    </StyledDragHandle>
                )}
                <KitFilter key={attributeId} {...filterChipProps} />
            </div>
            {visibilityButtonProps && <KitButton size="m" type="tertiary" {...visibilityButtonProps} />}
        </StyledFilterListItem>
    );
};
