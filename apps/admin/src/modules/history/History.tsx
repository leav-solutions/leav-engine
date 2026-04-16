// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitIdCard} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {HistoryContent} from './content/HistoryContent';
import {PageContainer} from '../ui/page/PageContainer';
import {PageHeader} from '../ui/page/PageHeader';
import {PageContentContainer} from '../ui/page/PageContentContainer';

export const History = () => {
    const {t} = useTranslation();

    return (
        <PageContainer>
            <PageHeader
                extraAlignLeft={<KitIdCard title={t('logs.title')} description={t('logs.description')} size="s" />}
            />
            <PageContentContainer>
                <HistoryContent />
            </PageContentContainer>
        </PageContainer>
    );
};
