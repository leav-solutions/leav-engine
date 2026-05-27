import {type ComponentProps} from 'react';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'react-i18next';

type BackButtonProps = Omit<ComponentProps<typeof KitButton>, 'icon' | 'size'> & {
    title?: string;
};

export const BackButton = ({title, ...props}: BackButtonProps) => {
    const {t} = useTranslation();

    return (
        <KitTooltip title={title ?? t('admin.back')}>
            <KitButton
                icon={<FontAwesomeIcon icon={faChevronLeft} size="2xs" color="var(--general-utilities-text-primary)" />}
                size="m"
                {...props}
            />
        </KitTooltip>
    );
};
