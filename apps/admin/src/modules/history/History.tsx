// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitIdCard} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {HistoryContent} from './content/HistoryContent';
import {historyContainer} from './history.module.css';

export const History = () => {
    const {t} = useTranslation();

    return (
        <div className={historyContainer}>
            <KitIdCard title={t('logs.title')} description={t('logs.description')} size="s" />
            <HistoryContent />
        </div>
    );
};
