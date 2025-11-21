// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ApplicationContext from 'context/ApplicationContext';
import {InMemoryCache, type InMemoryCacheConfig} from '@apollo/client';
import {MockedProvider, type MockedResponse} from '@apollo/client/testing';
import {MockedLangContextProvider} from '@leav/ui';
import {KitApp} from 'aristid-ds';
import {mockApplication} from './mocks/applications';
import {type IApplicationContext} from 'context/ApplicationContext/_types';
import {type PropsWithChildren} from 'react';
import {type GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {type GET_GLOBAL_SETTINGS_globalSettings} from '_gqlTypes/GET_GLOBAL_SETTINGS';

interface IProvidersProps {
    apolloMocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    currentApp?: GET_APPLICATION_BY_ID_applications_list;
    globalSettings?: GET_GLOBAL_SETTINGS_globalSettings;
}

export const TestProviders = ({
    children,
    apolloMocks,
    cacheSettings,
    currentApp,
    globalSettings,
}: PropsWithChildren<IProvidersProps>) => {
    const mockCache = new InMemoryCache(cacheSettings);

    const appContextData: IApplicationContext = {
        currentApp: currentApp ?? mockApplication,
        globalSettings: {
            name: 'My App',
            icon: null,
            ...globalSettings,
        },
    };

    return (
        <MockedLangContextProvider>
            <MockedProvider mocks={apolloMocks} cache={mockCache}>
                <KitApp>
                    <ApplicationContext.Provider value={appContextData}>
                        {children ?? <></>}
                    </ApplicationContext.Provider>
                </KitApp>
            </MockedProvider>
        </MockedLangContextProvider>
    );
};
