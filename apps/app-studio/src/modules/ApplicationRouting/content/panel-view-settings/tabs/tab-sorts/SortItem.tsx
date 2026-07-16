import {type ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowDownWideShort, faGripLines} from '@fortawesome/free-solid-svg-icons';
import {
    item,
    handleSlot,
    dragHandle,
    dragging,
    activateButton,
    activatedIcon,
    deactivatedIcon,
} from './sortItem.module.css';

export const SortItem = ({
    id,
    activated,
    draggable = true,
    onToggleActivated,
    children,
}: {
    id: string;
    activated: boolean;
    draggable?: boolean;
    onToggleActivated?: () => void;
    children: ReactNode;
}) => {
    const {t} = useTranslation();
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id,
        disabled: !draggable,
    });

    const pinLabel = activated
        ? String(t('view_settings.sorts.deactivate'))
        : String(t('view_settings.sorts.activate'));

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
                    className={activateButton}
                    type="tertiary"
                    size="s"
                    aria-label={pinLabel}
                    icon={
                        <FontAwesomeIcon
                            className={activated ? activatedIcon : deactivatedIcon}
                            icon={faArrowDownWideShort}
                        />
                    }
                    onClick={onToggleActivated}
                />
            </KitTooltip>
        </li>
    );
};
