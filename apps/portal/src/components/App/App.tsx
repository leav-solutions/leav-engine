// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {Layout} from 'antd';
import Applications from 'components/Applications';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import UserMenu from 'components/UserMenu';
import LangContext from 'context/LangContext';
import UserContext from 'context/UserContext';
import {getMe} from 'queries/me/me';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ME} from '_gqlTypes/ME';

const Header = styled(Layout.Header)`
    height: 3rem;
    background: transparent linear-gradient(85deg, #0f2027 0%, #203a43 52%, #2c5364 100%) 0% 0% no-repeat padding-box;
    padding-left: 1rem;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Title = styled.div`
    color: white;
    font-size: 1.5em;
    font-weight: bold;
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

    // Init lang
    const availableLangs = process.env.REACT_APP_AVAILABLE_LANG ? process.env.REACT_APP_AVAILABLE_LANG.split(',') : [];
    const defaultLang = process.env.REACT_APP_DEFAULT_LANG ? process.env.REACT_APP_DEFAULT_LANG : 'en';
    const userLang = i18n.language.split('-')[0];
    const fallbackLang = i18n.options.fallbackLng ? i18n.options.fallbackLng[0] : '';
    const [lang, setLang] = useState<string[]>([userLang, fallbackLang]);

    const _handleLanguageChange = (newLang: string): void => {
        i18n.changeLanguage(newLang);

        // Update cache lang infos
        setLang([i18n.language, fallbackLang]);
    };

    if (meLoading) {
        return <Loading />;
    }

    if (meError || !userData?.me) {
        return <ErrorDisplay message={meError.message || t('userdata_error')} />;
    }

    return (
        <LangContext.Provider value={{lang, availableLangs, defaultLang, setLang: _handleLanguageChange}}>
            <UserContext.Provider value={userData.me}>
                <Layout>
                    <Header>
                        <Title>{t('header_title')}</Title>
                        <UserMenu />
                    </Header>
                    <Content>
                        <Applications />
                    </Content>
                </Layout>
            </UserContext.Provider>
        </LangContext.Provider>
    );
}

export default App;
