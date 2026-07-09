import {type FunctionComponent} from 'react';
import {useTranslation} from 'react-i18next';
import {KitAlert} from 'aristid-ds';
import {useFullscreenAlertDismissal} from '../../../hooks/useFullscreenAlertDismissal';
import {fullscreenAlert} from './fullscreenAlert.module.css';

export const FullscreenAlert: FunctionComponent = () => {
    const {t} = useTranslation();
    const {isDismissed, dismiss} = useFullscreenAlertDismissal();

    if (isDismissed) {
        return null;
    }

    return (
        <KitAlert
            className={fullscreenAlert}
            type="info"
            closable
            onClose={dismiss}
            message={t('fullscreen.alert_title')}
            description={t('fullscreen.alert_description')}
        />
    );
};
