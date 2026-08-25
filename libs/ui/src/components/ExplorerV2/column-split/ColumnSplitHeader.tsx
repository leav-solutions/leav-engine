import {KitButton, KitTooltip, KitTypography} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faDownLeftAndUpRightToCenter, faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {columnSplitHeader} from './columnSplit.module.css';

interface IColumnSplitHeaderProps {
    label: string;
    isSplit: boolean;
    onToggle: () => void;
    disabledReason?: string;
}

/**
 * The header of a splittable column, in both its states: the plain column's label plus the split button,
 * or the split group's label plus the collapse button.
 */
export const ColumnSplitHeader = ({label, isSplit, onToggle, disabledReason}: IColumnSplitHeaderProps) => {
    const {t} = useSharedTranslation();
    const actionLabel = t(isSplit ? 'explorer.column_split.collapse' : 'explorer.column_split.expand');

    return (
        <span className={columnSplitHeader}>
            <KitTypography.Text size="fontSize5" weight="bold" ellipsis>
                {label}
            </KitTypography.Text>
            <KitTooltip title={disabledReason ?? actionLabel}>
                <KitButton
                    size="s"
                    type="tertiary"
                    icon={
                        <FontAwesomeIcon
                            icon={isSplit ? faDownLeftAndUpRightToCenter : faUpRightAndDownLeftFromCenter}
                        />
                    }
                    aria-label={actionLabel}
                    disabled={Boolean(disabledReason)}
                    onClick={onToggle}
                />
            </KitTooltip>
        </span>
    );
};
