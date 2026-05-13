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
