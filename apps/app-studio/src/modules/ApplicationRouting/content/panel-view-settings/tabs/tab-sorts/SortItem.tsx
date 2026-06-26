import {type ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowDownWideShort, faGripLines} from '@fortawesome/free-solid-svg-icons';
import {item, handleSlot, dragHandle, dragging, pinButton, pinnedIcon, unpinnedIcon} from './sortItem.module.css';

export const SortItem = ({
    id,
    pinned,
    draggable = true,
    onTogglePinned,
    children,
}: {
    id: string;
    pinned: boolean;
    draggable?: boolean;
    onTogglePinned?: () => void;
    children: ReactNode;
}) => {
    const {t} = useTranslation();
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id,
        disabled: !draggable,
    });

    const pinLabel = pinned ? String(t('view_settings.sorts.unpin')) : String(t('view_settings.sorts.pin'));

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
            <KitTooltip title={pinLabel}>
                <KitButton
                    className={pinButton}
                    type="tertiary"
                    size="s"
                    aria-label={pinLabel}
                    icon={
                        <FontAwesomeIcon className={pinned ? pinnedIcon : unpinnedIcon} icon={faArrowDownWideShort} />
                    }
                    onClick={onTogglePinned}
                />
            </KitTooltip>
        </li>
    );
};
