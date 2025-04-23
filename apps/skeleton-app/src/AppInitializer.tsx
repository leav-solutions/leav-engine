// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useState} from 'react';
import ReactModal from 'react-modal';
import {useTranslation} from 'react-i18next';
import {
    customTheme,
    ErrorBoundary,
    ErrorDisplay,
    ErrorDisplayTypes,
    LangContext,
    Loading,
    useAntdLocale,
    useAppLang
} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {ConfigProvider} from 'antd';
import {KitApp, KitGrid} from 'aristid-ds';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import {Router} from './routes/Router';
import {SIDEBAR_CONTENT_ID} from './constants';
import {useGetApplicationPermissionAndNameQuery, useGetLanguagesQuery} from './__generated__';

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

    const {data: availableLangs, loading: langsLoading, error: langsError} = useGetLanguagesQuery();

    const {
        data: applicationData,
        loading: applicationLoading,
        error: applicationError
    } = useGetApplicationPermissionAndNameQuery();

    const currentApp = applicationData?.applications?.list?.[0];

    // Triggered when lang change to update the document title
    useEffect(() => {
        if (!currentApp) {
            return;
        }

        document.title = localizedTranslation(currentApp.label, lang);
    }, [currentApp, lang]);

    // To update language in some components such as date-picker
    useEffect(() => {
        dayjs.locale(userLang);
    }, [userLang]);

    const _handleLanguageChange = (newLang: string): void => {
        i18n.changeLanguage(newLang);

        // Update cache lang infos
        setLang([i18n.language, fallbackLng]);
    };

    if (applicationLoading || langsLoading || appLangLoading) {
        return <Loading />;
    }

    if (applicationError || langsError || appLangErr) {
        return <ErrorDisplay message={applicationError?.message ?? appLangErr} />;
    }

    if (!currentApp) {
        return <ErrorDisplay message={t('applications.current_app_error', {appId: currentApp.id})} />;
    }

    if (!currentApp?.permissions?.access_application) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />;
    }

    return (
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
                    <KitGrid.KitCol>
                        <div id={SIDEBAR_CONTENT_ID} />
                    </KitGrid.KitCol>
                </KitApp>
            </ErrorBoundary>
        </LangContext.Provider>
    );
};
