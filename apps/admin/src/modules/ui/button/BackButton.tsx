// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps} from 'react';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'react-i18next';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '_ui/constants';

type BackButtonProps = Omit<ComponentProps<typeof KitButton>, 'icon' | 'size'> & {
    title?: string;
};

export const BackButton = ({title, ...props}: BackButtonProps) => {
    const {t} = useTranslation();

    return (
        <KitTooltip title={title ?? t('admin.back')} mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}>
            <KitButton
                icon={<FontAwesomeIcon icon={faChevronLeft} size="2xs" color="var(--general-utilities-text-primary)" />}
                size="m"
                {...props}
            />
        </KitTooltip>
    );
};
