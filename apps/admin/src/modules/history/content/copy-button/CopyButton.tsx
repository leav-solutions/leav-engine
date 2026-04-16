// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCopy} from '@fortawesome/free-solid-svg-icons';
import {KitAlert, KitButton, KitTooltip} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {type MouseEventHandler} from 'react';
import {SUCCESS_ALERT_DURATION, TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '@leav/ui';

type CopyButtonProps = {
    title: string;
    value: string;
    className?: string;
    iconColor?: string;
};

export const CopyButton = ({className, iconColor, title, value}: CopyButtonProps) => {
    const {t} = useTranslation();

    const handleCopy: MouseEventHandler<HTMLButtonElement> = e => {
        // Prevent from opening history details modal when clicking on the copy button
        e.stopPropagation();

        navigator.clipboard.writeText(value);
        KitAlert.success({
            message: t('logs.copy_button.copy_success', {title}),
            description: null,
            duration: SUCCESS_ALERT_DURATION,
            showIcon: true,
            closable: true,
        });
    };

    return (
        <KitTooltip
            title={t('logs.copy_button.copy')}
            mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}
            placement="bottom"
        >
            <KitButton
                className={className}
                type="tertiary"
                size="s"
                icon={<FontAwesomeIcon icon={faCopy} color={iconColor} />}
                onClick={handleCopy}
            />
        </KitTooltip>
    );
};
