// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
