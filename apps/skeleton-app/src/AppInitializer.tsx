// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useState} from 'react';
import ReactModal from 'react-modal';
import {useQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {
    APP_ENDPOINT,
    customTheme,
    ErrorBoundary,
    ErrorDisplay,
    ErrorDisplayTypes,
    IUserContext,
    LangContext,
    Loading,
    useAntdLocale,
    useAppLang,
    UserContext
} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {ConfigProvider} from 'antd';
import {KitApp} from 'aristid-ds';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import {getApplicationByEndpointQuery} from './graphQL/queries/applications/getApplicationByEndpointQuery';
import {getLangs} from './graphQL/queries/core/getLangs';
import {getGlobalSettingsQuery} from './graphQL/queries/globalSettings/getGlobalSettingsQuery';
import {
    GET_APPLICATION_BY_ENDPOINT,
    GET_APPLICATION_BY_ENDPOINTVariables
} from './_gqlTypes/GET_APPLICATION_BY_ENDPOINT';
import {GET_GLOBAL_SETTINGS} from './_gqlTypes/GET_GLOBAL_SETTINGS';
import {GET_LANGS} from './_gqlTypes/GET_LANGS';
import {Router} from './routes/Router';
import {getMe} from './graphQL/queries/userData/me';
import {ME} from '_gqlTypes/ME';

export const AppInitializer: FunctionComponent = () => {
    const {t, i18n} = useTranslation();

    ReactModal.setAppElement(document.getElementsByTagName('body')[0]);

    // Add lang infos to the cache
    const userLang = i18n.language.split('-')[0];
    const fallbackLng: string = i18n.options.fallbackLng ? i18n.options.fallbackLng[0] : '';
    const {lang: appLang, loading: appLangLoading, error: appLangErr} = useAppLang();

    const [lang, setLang] = useState([userLang, fallbackLng]);

    const locale = useAntdLocale(lang[0]);

    const localeByLang = {
        fr: 'frFR',
        en: 'enUS'
    };

    const {data: availableLangs, loading: langsLoading, error: langsError} = useQuery<GET_LANGS>(getLangs);

    const {data: userData, loading: meLoading, error: meError} = useQuery<ME>(getMe);

    const {
        data: applicationData,
        loading: applicationLoading,
        error: applicationError
    } = useQuery<GET_APPLICATION_BY_ENDPOINT, GET_APPLICATION_BY_ENDPOINTVariables>(getApplicationByEndpointQuery, {
        variables: {endpoint: APP_ENDPOINT}
    });

    const {
        data: globalSettingsData,
        loading: globalSettingsLoading,
        error: globalSettingsError
    } = useQuery<GET_GLOBAL_SETTINGS>(getGlobalSettingsQuery);

    const currentApp = applicationData?.applications?.list?.[0];
    const globalSettings = globalSettingsData?.globalSettings;

    // Triggered when lang change, to update document title
    useEffect(() => {
        if (!globalSettings || !currentApp) {
            return;
        }

        document.title = `${globalSettings.name} - ${localizedTranslation(currentApp.label, lang)}`;
    }, [currentApp, globalSettings, lang]);

    // To update language in some components such as date-picker
    useEffect(() => {
        dayjs.locale(userLang);
    }, [userLang]);

    const _handleLanguageChange = (newLang: string): void => {
        i18n.changeLanguage(newLang);

        // Update cache lang infos
        setLang([i18n.language, fallbackLng]);
    };

    if (meLoading || applicationLoading || globalSettingsLoading || langsLoading || appLangLoading) {
        return <Loading />;
    }

    if (meError || applicationError || globalSettingsError || langsError || appLangErr) {
        const error = applicationError || globalSettingsError;
        return <ErrorDisplay message={error?.message ?? appLangErr} />;
    }

    if (!currentApp) {
        return <ErrorDisplay message={t('applications.current_app_error', {appId: currentApp.id})} />;
    }

    if (!currentApp?.permissions?.access_application) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />;
    }

    const userContextData: IUserContext['userData'] = {
        userId: userData?.me?.id,
        userWhoAmI: userData?.me?.whoAmI
    };

    return (
        <UserContext.Provider value={{userData: userContextData}}>
            <LangContext.Provider
                value={{
                    lang,
                    availableLangs: availableLangs.langs,
                    defaultLang: appLang,
                    setLang: _handleLanguageChange
                }}
            >
                <ErrorBoundary>
                    <KitApp
                        locale={{
                            locale: localeByLang[lang[0]],
                            ItemList: null,
                            Image: null
                        }}
                    >
                        <ConfigProvider theme={customTheme} locale={locale}>
                            <Router />
                        </ConfigProvider>
                    </KitApp>
                </ErrorBoundary>
            </LangContext.Provider>
        </UserContext.Provider>
    );
};
