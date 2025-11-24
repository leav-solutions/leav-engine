// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDivider, KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {informationAndHistoryHeader} from './informationAndHistory.module.css';

export const InformationAndHistoryHeader = () => {
    const {t} = useTranslation();

    return (
        <section className={informationAndHistoryHeader}>
            <KitTypography.Title level="h4">{t('information_and_history.system_information')}</KitTypography.Title>
            <KitDivider noMargin />
        </section>
    );
};
