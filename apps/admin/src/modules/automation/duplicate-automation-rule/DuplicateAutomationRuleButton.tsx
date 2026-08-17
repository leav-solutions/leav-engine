import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClone} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'react-i18next';

type DuplicateAutomationRuleButtonProps = {
    onClick: () => void;
    disabled?: boolean;
    disabledReason?: string;
    variant?: 'icon' | 'labelled';
};

export const DuplicateAutomationRuleButton = ({
    onClick,
    disabled = false,
    disabledReason,
    variant = 'icon',
}: DuplicateAutomationRuleButtonProps) => {
    const {t} = useTranslation();
    const isLabelled = variant === 'labelled';

    return (
        <KitTooltip title={disabled ? disabledReason : !isLabelled ? t('automation.duplicate.action') : undefined}>
            <KitButton
                size={isLabelled ? 'm' : 's'}
                icon={<FontAwesomeIcon icon={faClone} />}
                disabled={disabled}
                onClick={e => {
                    e.stopPropagation(); // in the table, the row is clickable and would navigate to the edition page
                    onClick();
                }}
            >
                {isLabelled ? t('automation.duplicate.action') : undefined}
            </KitButton>
        </KitTooltip>
    );
};
