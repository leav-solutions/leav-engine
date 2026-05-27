import {KitTooltip, KitButton} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'react-i18next';

type DeleteAutomationRuleButtonProps = {
    onClick: () => void;
};

export const DeleteAutomationRuleButton = ({onClick}: DeleteAutomationRuleButtonProps) => {
    const {t} = useTranslation();

    return (
        <KitTooltip title={t('admin.remove')}>
            <KitButton
                size="s"
                icon={<FontAwesomeIcon icon={faTrash} />}
                onClick={e => {
                    e.stopPropagation();
                    onClick();
                }}
                danger
            />
        </KitTooltip>
    );
};
