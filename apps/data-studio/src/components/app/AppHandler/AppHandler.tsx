// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery, useSubscription} from '@apollo/client';
import {ErrorDisplay, ErrorDisplayTypes, LangContext, Loading, customTheme, useAntdLocale, useAppLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {GET_APPLICATION_BY_ENDPOINT, GET_APPLICATION_BY_ENDPOINTVariables} from '_gqlTypes/GET_APPLICATION_BY_ENDPOINT';
import {GET_GLOBAL_SETTINGS} from '_gqlTypes/GET_GLOBAL_SETTINGS';
import {GET_LANGS} from '_gqlTypes/GET_LANGS';
import {ConfigProvider, theme} from 'antd';
import ApplicationContext from 'context/ApplicationContext';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import {getApplicationByEndpointQuery} from 'graphQL/queries/applications/getApplicationByEndpointQuery';
import {getLangs} from 'graphQL/queries/core/getLangs';
import {getGlobalSettingsQuery} from 'graphQL/queries/globalSettings/getGlobalSettingsQuery';
import {getTasks} from 'graphQL/queries/tasks/getTasks';
import {getTaskUpdates} from 'graphQL/subscribes/tasks/getTaskUpdates';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppDispatch} from 'reduxStore/store';
import {addTask} from 'reduxStore/tasks';
import {ThemeProvider} from 'styled-components';
import {ME} from '../../../_gqlTypes/ME';
import {APP_ENDPOINT} from '../../../constants';
import {getMe} from '../../../graphQL/queries/userData/me';
import {initialActiveLibrary, useActiveLibrary} from '../../../hooks/ActiveLibHook/ActiveLibHook';
import {useUser} from '../../../hooks/UserHook/UserHook';
import Router from '../../Router';

function AppHandler(): JSX.Element {
    const {t, i18n} = useTranslation();
    const dispatch = useAppDispatch();
    const {lang: appLang, loading: appLangLoading, error: appLangErr} = useAppLang();
    const {token: themeToken} = theme.useToken();

    // Add lang infos to the cache
    const userLang = i18n.language.split('-')[0];
    const fallbackLang = i18n.options.fallbackLng ? i18n.options.fallbackLng[0] : '';
    const [lang, setLang] = useState<string[]>([userLang, fallbackLang]);
    const locale = useAntdLocale(lang[0]);

    const {data: availableLangs, loading: langsLoading, error: langsError} = useQuery<GET_LANGS>(getLangs);

    const [activeLibrary, updateActiveLibrary] = useActiveLibrary();
    const [user, updateUser] = useUser();
    const {data: userData, loading: meLoading, error: meError} = useQuery<ME>(getMe);

    const {data: applicationData, loading: applicationLoading, error: applicationError} = useQuery<
        GET_APPLICATION_BY_ENDPOINT,
        GET_APPLICATION_BY_ENDPOINTVariables
    >(getApplicationByEndpointQuery, {variables: {endpoint: APP_ENDPOINT}});

    const {
        data: globalSettingsData,
        loading: globalSettingsLoading,
        error: globalSettingsError
    } = useQuery<GET_GLOBAL_SETTINGS>(getGlobalSettingsQuery);

    const currentApp = applicationData?.applications?.list?.[0];
    const globalSettings = globalSettingsData?.globalSettings;

    const {error: tasksError} = useQuery(getTasks, {
        variables: {
            filters: {
                created_by: userData?.me?.id,
                archive: false
            }
        },
        skip: !userData?.me?.id,
        onCompleted: data => {
            for (const task of data.tasks.list) {
                dispatch(addTask(task));
            }
        }
    });

    useSubscription(getTaskUpdates, {
        variables: {filters: {created_by: userData?.me?.id, archive: false}},
        skip: !userData?.me?.id,
        onSubscriptionData: subData => {
            const task = subData.subscriptionData.data.task;
            dispatch(addTask(task));
        }
    });

    // Triggered when active library change
    useEffect(() => {
        if (!activeLibrary) {
            updateActiveLibrary(initialActiveLibrary);
        }
    }, [updateActiveLibrary, activeLibrary]);

    // Triggered when user data change
    useEffect(() => {
        if (!user && userData && !meLoading) {
            updateUser({
                userId: userData.me.id,
                userPermissions: {},
                userWhoAmI: userData?.me?.whoAmI
            }); // FIXME: permissions ??
        }
    }, [updateUser, user, meLoading, userData]);

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
        setLang([i18n.language, fallbackLang]);
    };

    if (meLoading || applicationLoading || globalSettingsLoading || langsLoading || appLangLoading) {
        return <Loading />;
    }

    if (meError || tasksError || applicationError || globalSettingsError || langsError || appLangErr) {
        const error = meError || tasksError || applicationError || globalSettingsError;
        return <ErrorDisplay message={error?.message ?? appLangErr} />;
    }

    if (!currentApp) {
        return <ErrorDisplay message={t('applications.current_app_error', {appId: currentApp.id})} />;
    }

    if (!currentApp?.permissions?.access_application) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />;
    }

    const appContextData = {
        currentApp,
        globalSettings
    };

    return (
        <ThemeProvider theme={{antd: themeToken}}>
            <LangContext.Provider
                value={{
                    lang,
                    availableLangs: availableLangs.langs,
                    defaultLang: i18n?.language.split('-')[0] ?? appLang,
                    setLang: _handleLanguageChange
                }}
            >
                <ApplicationContext.Provider value={appContextData}>
                    <ConfigProvider theme={customTheme} locale={locale}>
                        <Router />
                    </ConfigProvider>
                </ApplicationContext.Provider>
            </LangContext.Provider>
        </ThemeProvider>
    );
}

export default AppHandler;
