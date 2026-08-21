import {type KeyboardEvent, type MouseEvent} from 'react';
import {type CheckboxChangeEvent} from 'antd/es/checkbox';
import {useDraggable} from '@dnd-kit/core';
import {type IDataViewChildProps, type IItemData} from '../_types';
import {type IKanbanColumn} from '../grouping/_types';
import {KanbanCardContent} from './KanbanCardContent';
import {cardNoImage, clickableCard, cardDragging} from './kanbanView.module.css';

export interface IKanbanDragData {
    card: IItemData;
    sourceColumn: IKanbanColumn;
}

interface IKanbanCardProps {
    card: IItemData;
    kanbanColumn: IKanbanColumn;
    cardAttributeIds: string[];
    attributesProperties: IDataViewChildProps['attributesProperties'];
    libraryColorConfigById: IDataViewChildProps['libraryColorConfigById'];
    isDragEnabled: boolean;
    isSelected: boolean;
    onSelect?: (event: CheckboxChangeEvent) => void;
    onCardClick?: (card: IItemData) => void;
}

export const KanbanCard = ({
    card,
    kanbanColumn,
    cardAttributeIds,
    attributesProperties,
    libraryColorConfigById,
    isDragEnabled,
    isSelected,
    onSelect,
    onCardClick,
}: IKanbanCardProps) => {
    const dragData: IKanbanDragData = {card, sourceColumn: kanbanColumn};
    const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
        id: card.key,
        data: dragData,
        disabled: !isDragEnabled,
    });

    const hasPreview = Boolean(card.whoAmI.preview?.small);
    const wrapperClassName = [
        hasPreview ? null : cardNoImage,
        onCardClick ? clickableCard : null,
        // The dragged source stays in place, dimmed — the DragOverlay clone is what follows the pointer.
        isDragging ? cardDragging : null,
    ]
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .join(' ');

    const cardContent = (
        <KanbanCardContent
            card={card}
            cardAttributeIds={cardAttributeIds}
            attributesProperties={attributesProperties}
            libraryColorConfigById={libraryColorConfigById}
            isSelected={isSelected}
            onSelect={onSelect}
        />
    );

    // KitItemCard has no onClick prop, so opening a record is wired on a wrapping element. The drag
    // activation distance keeps that click working alongside the drag listeners. The selection
    // checkbox lives inside that same card and its click bubbles up here — ignore any click landing
    // on a form control (the checkbox's label/input, whatever the DS internal class names are) so
    // ticking the checkbox doesn't also open the record.
    const handleWrapperClick = (event: MouseEvent<HTMLDivElement>) => {
        if ((event.target as HTMLElement).closest('label, input, button')) {
            return;
        }
        onCardClick?.(card);
    };

    // The wrapper advertises role="button" (via the useDraggable attributes), so it must also be
    // keyboard-activatable: Enter/Space open the record like a click does. preventDefault keeps
    // Space from scrolling the board.
    const handleWrapperKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onCardClick?.(card);
        }
    };

    return onCardClick ? (
        <div
            ref={setNodeRef}
            className={wrapperClassName}
            role="button"
            tabIndex={0}
            onClick={handleWrapperClick}
            onKeyDown={handleWrapperKeyDown}
            {...listeners}
            {...attributes}
        >
            {cardContent}
        </div>
    ) : (
        <div ref={setNodeRef} className={wrapperClassName} {...listeners} {...attributes}>
            {cardContent}
        </div>
    );
};
