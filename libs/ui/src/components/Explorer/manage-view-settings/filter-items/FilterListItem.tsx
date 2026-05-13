import {type ComponentProps, type FunctionComponent} from 'react';
import styled from 'styled-components';
import {KitButton} from 'aristid-ds';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faGripLines} from '@fortawesome/free-solid-svg-icons';

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
    visibilityButtonProps?: Pick<ComponentProps<typeof KitButton>, 'onClick' | 'icon' | 'title'>;
}

export const FilterListItem: FunctionComponent<IActiveFilterListItemProps> = ({
    attributeId,
    isDraggable,
    visibilityButtonProps,
    children,
}) => {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: attributeId});
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <StyledFilterListItem ref={setNodeRef} style={style}>
            <div>
                {isDraggable && (
                    <StyledDragHandle {...attributes} {...listeners} $isDragging={isDragging}>
                        <FontAwesomeIcon icon={faGripLines} />
                    </StyledDragHandle>
                )}
                {children}
            </div>
            {visibilityButtonProps && <KitButton size="m" type="tertiary" {...visibilityButtonProps} />}
        </StyledFilterListItem>
    );
};
