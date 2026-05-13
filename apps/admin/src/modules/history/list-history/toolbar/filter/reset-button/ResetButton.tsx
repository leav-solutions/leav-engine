import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {KitButton} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {resetButton} from './resetButton.module.css';

type ResetButtonProps = {
    loading: boolean;
    onReset: () => void;
};

export const ResetButton = ({loading, onReset}: ResetButtonProps) => {
    const {t} = useTranslation();

    return (
        <KitButton
            className={resetButton}
            size="s"
            icon={<FontAwesomeIcon icon={faTrash} />}
            onClick={onReset}
            disabled={loading}
            danger
        >
            {t('admin.reset')}
        </KitButton>
    );
};
