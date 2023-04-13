// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {customTheme, LangContext} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {ConfigProvider, Layout, theme} from 'antd';
import Applications from 'components/Applications';
import AppIcon from 'components/shared/AppIcon';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import UserMenu from 'components/UserMenu';
import {APP_ENDPOINT} from '../../constants';
import ApplicationContext from 'context/ApplicationContext';
import UserContext from 'context/UserContext';
import {useApplicationEventsSubscription} from 'hooks/useApplicationEventsSubscription';
import useRedirectionError from 'hooks/useRedirectionError';
import {getApplicationsQuery} from 'queries/applications/getApplicationsQuery';
import {getGlobalSettingsQuery} from 'queries/globalSettings/getGlobalSettingsQuery';
import {getMe} from 'queries/me/me';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled, {ThemeProvider} from 'styled-components';
import {GET_APPLICATIONS, GET_APPLICATIONSVariables} from '_gqlTypes/GET_APPLICATIONS';
import {GET_GLOBAL_SETTINGS} from '_gqlTypes/GET_GLOBAL_SETTINGS';
import {ME} from '_gqlTypes/ME';
import useAppLang from 'hooks/useAppLang';
import {GET_LANGS} from '_gqlTypes/GET_LANGS';
import {getLangs} from 'queries/core/getLangs';

const Header = styled(Layout.Header)`
    position: relative;
    box-shadow: 0 1px 2px #ccc;
    display: flex;
    align-items: center;
`;

const Content = styled(Layout.Content)`
    display: grid;
    grid-template-rows: 3rem 1fr;
    height: calc(100vh - 3rem);
    overflow-y: auto;
    background: #fff;
`;

function App(): JSX.Element {
    const {t, i18n} = useTranslation();
    const {lang: appLang, loading: appLangLoading, error: appLangErr} = useAppLang();
    const {data: userData, loading: meLoading, error: meError} = useQuery<ME>(getMe);
    const {token: themeToken} = theme.useToken();

    const userLang = i18n.language.split('-')[0];
    const fallbackLang = i18n.options.fallbackLng ? i18n.options.fallbackLng[0] : '';
    const [lang, setLang] = useState<string[]>([userLang, fallbackLang]);

    const {data: availableLangs, loading: langsLoading, error: langsError} = useQuery<GET_LANGS>(getLangs);

    const {data: applicationData, loading: applicationLoading, error: applicationError} = useQuery<
        GET_APPLICATIONS,
        GET_APPLICATIONSVariables
    >(getApplicationsQuery, {
        variables: {filters: {endpoint: APP_ENDPOINT}}
    });

    const {
        data: globalSettingsData,
        loading: globalSettingsLoading,
        error: globalSettingsError
    } = useQuery<GET_GLOBAL_SETTINGS>(getGlobalSettingsQuery);

    const currentApp = applicationData?.applications?.list?.[0];
    const globalSettings = globalSettingsData?.globalSettings;

    useApplicationEventsSubscription();

    useEffect(() => {
        if (!globalSettings || !currentApp) {
            return;
        }

        document.title = `${globalSettings.name} - ${localizedTranslation(currentApp.label, lang)}`;
    }, [currentApp, globalSettings, lang, t]);

    const handleRedirectionError = useRedirectionError();

    useEffect(() => {
        handleRedirectionError();
    }, []);

    const _handleLanguageChange = (newLang: string): void => {
        i18n.changeLanguage(newLang);

        // Update cache lang infos
        setLang([i18n.language, fallbackLang]);
    };

    if (meLoading || applicationLoading || globalSettingsLoading || langsLoading || appLangLoading) {
        return <Loading />;
    }

    if (meError || applicationError || globalSettingsError || langsError || !userData?.me || appLangErr) {
        return (
            <ErrorDisplay
                message={
                    meError?.message ||
                    applicationError?.message ||
                    globalSettingsError?.message ||
                    appLangErr ||
                    t('userdata_error')
                }
            />
        );
    }

    const appContextData = {
        currentApp,
        globalSettings
    };

    return (
        <LangContext.Provider
            value={{lang, availableLangs: availableLangs.langs, defaultLang: appLang, setLang: _handleLanguageChange}}
        >
            <ApplicationContext.Provider value={appContextData}>
                <UserContext.Provider value={userData.me}>
                    <ConfigProvider theme={customTheme}>
                        <ThemeProvider theme={{antd: themeToken}}>
                            <Layout>
                                <Header>
                                    <AppIcon size="tiny" style={{maxHeight: '2rem', margin: 'auto'}} />
                                    <UserMenu />
                                </Header>
                                <Content>
                                    <Applications />
                                </Content>
                            </Layout>
                        </ThemeProvider>
                    </ConfigProvider>
                </UserContext.Provider>
            </ApplicationContext.Provider>
        </LangContext.Provider>
    );
}

export default App;
