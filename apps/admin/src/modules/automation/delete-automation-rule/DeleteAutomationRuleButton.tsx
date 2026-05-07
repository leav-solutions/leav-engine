// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitTooltip, KitButton} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '_ui/constants';
import {useTranslation} from 'react-i18next';

type DeleteAutomationRuleButtonProps = {
    onClick: () => void;
};

export const DeleteAutomationRuleButton = ({onClick}: DeleteAutomationRuleButtonProps) => {
    const {t} = useTranslation();

    return (
        <KitTooltip title={t('admin.remove')} mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}>
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
