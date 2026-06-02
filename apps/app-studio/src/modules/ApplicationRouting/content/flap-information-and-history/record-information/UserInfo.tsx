import {KitButton} from 'aristid-ds';
import {recordInformationUserInfo} from './recordInformation.module.css';
import {useTranslation} from 'react-i18next';

export const UserInfo = ({email, id}: {email: string | null; id: string | null}) => {
    const {t} = useTranslation();
    const href = email ? `mailto:${email}` : null;

    return (
        <KitButton className={recordInformationUserInfo} type="link" href={href}>
            {email ?? id ?? t('information_and_history.unknown_user')}
        </KitButton>
    );
};
