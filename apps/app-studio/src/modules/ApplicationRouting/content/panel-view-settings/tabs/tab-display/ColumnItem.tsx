import {KitTooltip, KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEye, faEyeSlash, faGripLines} from '@fortawesome/free-solid-svg-icons';
import {
    dragHandle,
    dragging,
    item,
    columnTitle,
    handleSlot,
    visibilityButton,
    visibleIcon,
    hiddenIcon,
} from './columnItem.module.css';

export const ColumnItem = ({
    id,
    title,
    visible,
    locked = false,
    draggable = false,
    onToggleVisibility,
}: {
    id: string;
    title: string;
    visible: boolean;
    locked?: boolean;
    draggable?: boolean;
    onToggleVisibility?: () => void;
}) => {
    const {t} = useTranslation();
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id,
        disabled: !draggable,
    });

    const visibilityLabel = visible
        ? String(t('view_settings.display.columns.hide'))
        : String(t('view_settings.display.columns.show'));

    return (
        <li
            ref={setNodeRef}
            className={item}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            {draggable ? (
                <span
                    {...attributes}
                    {...listeners}
                    className={`${handleSlot} ${dragHandle}${isDragging ? ` ${dragging}` : ''}`}
                >
                    <FontAwesomeIcon icon={faGripLines} />
                </span>
            ) : locked ? (
                <span className={handleSlot} />
            ) : null}
            <KitTypography.Text className={columnTitle} size="fontSize5" ellipsis>
                {title}
            </KitTypography.Text>
            <KitTooltip title={locked ? undefined : visibilityLabel}>
                <button
                    className={visibilityButton}
                    aria-label={visibilityLabel}
                    disabled={locked}
                    onClick={onToggleVisibility}
                >
                    {visible ? (
                        <FontAwesomeIcon className={locked ? hiddenIcon : visibleIcon} icon={faEye} />
                    ) : (
                        <FontAwesomeIcon className={hiddenIcon} icon={faEyeSlash} />
                    )}
                </button>
            </KitTooltip>
        </li>
    );
};
