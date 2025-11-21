// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ApplicationContext from 'context/CurrentApplicationContext';
import {MemoryRouter} from 'react-router-dom-v5';
import {mockApplicationDetails} from '__mocks__/common/applications';
import MockedLangContextProvider from '__mocks__/MockedLangContextProvider';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import MockedUserContextProvider from '__mocks__/MockedUserContextProvider';
import {MockStore} from '__mocks__/reduxProvider';
import {type ICurrentApplicationContext} from 'context/CurrentApplicationContext/_types';
import {type PropsWithChildren, type ReactElement} from 'react';
import {type InMemoryCacheConfig} from '@apollo/client';
import {type MockedResponse} from '@apollo/client/testing';
import {type MemoryRouterProps} from 'react-router-v5';
import {type RootState} from 'reduxStore/store';
import {type GET_GLOBAL_SETTINGS_globalSettings} from '_gqlTypes/GET_GLOBAL_SETTINGS';

interface IProvidersProps {
    apolloMocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    routerProps?: MemoryRouterProps;
    storeState?: Partial<RootState>;
    globalSettings?: GET_GLOBAL_SETTINGS_globalSettings;
    userPermissions?: {[permName: string]: boolean};
}

export const TestProviders = ({
    children,
    apolloMocks,
    cacheSettings,
    routerProps,
    storeState,
    globalSettings,
    userPermissions,
}: PropsWithChildren<IProvidersProps>) => {
    const appContextData: ICurrentApplicationContext = {
        currentApp: mockApplicationDetails,
        globalSettings: {
            name: 'My App',
            icon: null,
            ...globalSettings,
        },
    };

    return (
        <MockStore state={storeState}>
            <MockedProviderWithFragments mocks={apolloMocks} cacheSettings={cacheSettings}>
                <MockedLangContextProvider>
                    <MockedUserContextProvider permissions={userPermissions}>
                        <ApplicationContext.Provider value={appContextData}>
                            <MemoryRouter {...routerProps}>{children as ReactElement}</MemoryRouter>
                        </ApplicationContext.Provider>
                    </MockedUserContextProvider>
                </MockedLangContextProvider>
            </MockedProviderWithFragments>
        </MockStore>
    );
};
