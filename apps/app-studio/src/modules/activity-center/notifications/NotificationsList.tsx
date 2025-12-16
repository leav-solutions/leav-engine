// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitEmpty} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {activityCenterTabEmptyContent} from '../activityCenter.module.css';

export const NotificationsList = () => {
    const {t} = useTranslation();
    return (
        <KitEmpty
            className={activityCenterTabEmptyContent}
            image={KitEmpty.ASSET_LIST}
            description={t('temporary.upcoming')}
        />
    );
};
