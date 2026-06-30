import {type ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFilter, faGripLines} from '@fortawesome/free-solid-svg-icons';
import {item, handleSlot, dragHandle, dragging, pinButton, pinnedIcon, unpinnedIcon} from './filterItem.module.css';

/**
 * One filter row in the filters tab. Mirrors `SortItem`: drag handle (when pinned) + the value editor
 * (`children`) + a single right-aligned button that IS the pin/unpin toggle. Here that button uses the
 * funnel icon (`faFilter`), blue when pinned (the filter shows in the ExplorerV2 FilterToolBar) and
 * grey otherwise.
 */
export const FilterItem = ({
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

    const pinLabel = pinned ? String(t('view_settings.filters.unpin')) : String(t('view_settings.filters.pin'));

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
                    icon={<FontAwesomeIcon className={pinned ? pinnedIcon : unpinnedIcon} icon={faFilter} />}
                    onClick={onTogglePinned}
                />
            </KitTooltip>
        </li>
    );
};
