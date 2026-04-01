// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitIdCard} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {AutomationContent} from './content/AutomationContent';
import {PageContainer} from '../ui/page/PageContainer';
import {PageContentContainer} from '../ui/page/PageContentContainer';

export const Automation = () => {
    const {t} = useTranslation();

    return (
        <PageContainer>
            <KitIdCard title={t('automation.title')} description={t('automation.description')} size="s" />
            <PageContentContainer>
                <AutomationContent />
            </PageContentContainer>
        </PageContainer>
    );
};
