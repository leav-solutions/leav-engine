// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
