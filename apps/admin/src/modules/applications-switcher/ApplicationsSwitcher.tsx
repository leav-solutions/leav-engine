import {localizedTranslation} from '@leav/utils';
import {KitItemList} from 'aristid-ds';
import {type IKitIdCard} from 'aristid-ds/dist/Kit/DataDisplay/IdCard/types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHouse} from '@fortawesome/free-solid-svg-icons';
import {type FunctionComponent} from 'react';
import {useTranslation} from 'react-i18next';
import {useCurrentApplicationContext} from '../../context/CurrentApplicationContext';
import useLang from '../../hooks/useLang';
import {useGetApplicationsQuery} from '../../_gqlTypes';
import {appList} from './applicationsSwitcher.module.css';

// Hardcoded IDs for portal and login will be removed when they'll be configured
const PORTAL_APP_ID = 'portal';
const LOGIN_APP_ID = 'login';

// Rendered as the content of the KitHeader `menu` dropdown (the launcher button is provided by KitHeader).
export const ApplicationsSwitcher: FunctionComponent = () => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {loading, error, data} = useGetApplicationsQuery();
    const applicationData = useCurrentApplicationContext();

    const _renderAppItem = (id: string, url: string, idCardProps: IKitIdCard) => (
        <KitItemList key={id} idCardProps={idCardProps} onClick={() => window.location.assign(url)} />
    );

    if (loading) {
        return <div className={appList}>{t('admin.loading')}</div>;
    }

    if (error) {
        return <div className={appList}>{error.message}</div>;
    }

    const apps = data?.applications?.list ?? [];
    const portalApp = apps.find(app => app.id === PORTAL_APP_ID);
    const loginApp = apps.find(app => app.id === LOGIN_APP_ID);

    return (
        <div className={appList}>
            {portalApp
                ? _renderAppItem(portalApp.id, portalApp.url, {
                      title: localizedTranslation(portalApp.label, lang),
                      avatarProps: {icon: <FontAwesomeIcon icon={faHouse} />},
                  })
                : null}
            {apps
                // Do not display current app in the list. Portal and login are also filtered out.
                .filter(
                    app => app.id !== applicationData.currentApp.id && ![portalApp?.id, loginApp?.id].includes(app.id),
                )
                .map(app =>
                    _renderAppItem(app.id, app.url, {
                        title: localizedTranslation(app.label, lang),
                        description: localizedTranslation(app.description, lang),
                        avatarProps: {
                            label: localizedTranslation(app.label, lang),
                            color: app.color ?? undefined,
                            src: (app?.icon?.whoAmI?.preview?.small as string) ?? undefined,
                        },
                    }),
                )}
        </div>
    );
};
