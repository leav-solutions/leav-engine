import {type ReactNode} from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faGripLines} from '@fortawesome/free-solid-svg-icons';
import {item, handleSlot, dragHandle, dragging} from './sortItem.module.css';

export const SortItem = ({id, draggable = true, children}: {id: string; draggable?: boolean; children: ReactNode}) => {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id,
        disabled: !draggable,
    });

    return (
        <li
            ref={setNodeRef}
            className={item}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            {draggable && (
                <span
                    {...attributes}
                    {...listeners}
                    className={`${handleSlot} ${dragHandle}${isDragging ? ` ${dragging}` : ''}`}
                >
                    <FontAwesomeIcon icon={faGripLines} />
                </span>
            )}
            {children}
        </li>
    );
};
