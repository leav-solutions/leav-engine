// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {customTheme, LangContext} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {ConfigProvider, Layout} from 'antd';
import Applications from 'components/Applications';
import AppIcon from 'components/shared/AppIcon';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import UserMenu from 'components/UserMenu';
import ApplicationContext from 'context/ApplicationContext';
import UserContext from 'context/UserContext';
import useRedirectionError from 'hooks/useRedirectionError';
import {getApplicationByIdQuery} from 'queries/applications/getApplicationByIdQuery';
import {getGlobalSettingsQuery} from 'queries/globalSettings/getGlobalSettingsQuery';
import {getMe} from 'queries/me/me';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {GET_APPLICATION_BY_ID, GET_APPLICATION_BY_IDVariables} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {GET_GLOBAL_SETTINGS} from '_gqlTypes/GET_GLOBAL_SETTINGS';
import {ME} from '_gqlTypes/ME';

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
    const {data: userData, loading: meLoading, error: meError} = useQuery<ME>(getMe);
    const appId = import.meta.env.VITE_APPLICATION_ID;

    // Init lang
    const availableLangs = import.meta.env.VITE_AVAILABLE_LANG ? import.meta.env.VITE_AVAILABLE_LANG.split(',') : [];
    const defaultLang = import.meta.env.VITE_DEFAULT_LANG ? import.meta.env.VITE_DEFAULT_LANG : 'en';
    const userLang = i18n.language.split('-')[0];
    const fallbackLang = i18n.options.fallbackLng ? i18n.options.fallbackLng[0] : '';
    const [lang, setLang] = useState<string[]>([userLang, fallbackLang]);

    const {data: applicationData, loading: applicationLoading, error: applicationError} = useQuery<
        GET_APPLICATION_BY_ID,
        GET_APPLICATION_BY_IDVariables
    >(getApplicationByIdQuery, {variables: {id: appId ?? ''}});

    const {
        data: globalSettingsData,
        loading: globalSettingsLoading,
        error: globalSettingsError
    } = useQuery<GET_GLOBAL_SETTINGS>(getGlobalSettingsQuery);

    const currentApp = applicationData?.applications?.list?.[0];
    const globalSettings = globalSettingsData?.globalSettings;

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

    if (meLoading || applicationLoading || globalSettingsLoading) {
        return <Loading />;
    }

    if (meError || applicationError || globalSettingsError || !userData?.me) {
        return (
            <ErrorDisplay
                message={
                    meError?.message || applicationError?.message || globalSettingsError?.message || t('userdata_error')
                }
            />
        );
    }

    const appContextData = {
        currentApp,
        globalSettings
    };

    return (
        <LangContext.Provider value={{lang, availableLangs, defaultLang, setLang: _handleLanguageChange}}>
            <ApplicationContext.Provider value={appContextData}>
                <UserContext.Provider value={userData.me}>
                    <ConfigProvider theme={customTheme}>
                        <Layout>
                            <Header>
                                <AppIcon size="tiny" style={{maxHeight: '2rem', margin: 'auto'}} />
                                <UserMenu />
                            </Header>
                            <Content>
                                <Applications />
                            </Content>
                        </Layout>
                    </ConfigProvider>
                </UserContext.Provider>
            </ApplicationContext.Provider>
        </LangContext.Provider>
    );
}

export default App;
