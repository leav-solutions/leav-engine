// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* eslint-disable react-refresh/only-export-components */
import {InMemoryCacheConfig} from '@apollo/client';
import {MockedResponse} from '@apollo/client/testing';
import {ILangContext, IUserContext, LangContext, UserContext} from '@leav/ui';
import {render, RenderOptions, RenderResult} from '@testing-library/react';
import ApplicationContext from 'context/ApplicationContext';
import {IApplicationContext} from 'context/ApplicationContext/_types';
import {PropsWithChildren, ReactElement} from 'react';
import {RootState} from 'reduxStore/store';
import {GET_APPLICATION_BY_ENDPOINT_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ENDPOINT';
import {GET_GLOBAL_SETTINGS_globalSettings} from '_gqlTypes/GET_GLOBAL_SETTINGS';
import {mockApplicationDetails} from '__mocks__/common/applications';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {mockRecord} from '__mocks__/common/record';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';

export interface ICustomRenderOptions extends RenderOptions {
    apolloMocks?: readonly MockedResponse[];
    storeState?: Partial<RootState>;
    cacheSettings?: InMemoryCacheConfig;
    currentApp?: GET_APPLICATION_BY_ENDPOINT_applications_list;
    [key: string]: any;
}

interface IProvidersProps {
    apolloMocks?: readonly MockedResponse[];
    storeState?: Partial<RootState>;
    cacheSettings?: InMemoryCacheConfig;
    currentApp?: GET_APPLICATION_BY_ENDPOINT_applications_list;
    globalSettings?: GET_GLOBAL_SETTINGS_globalSettings;
}

const Providers = ({
    children,
    apolloMocks,
    storeState,
    cacheSettings,
    currentApp,
    globalSettings
}: PropsWithChildren<IProvidersProps>) => {
    const appContextData: IApplicationContext = {
        currentApp: currentApp ?? mockApplicationDetails,
        globalSettings: {
            name: 'My App',
            icon: null,
            ...globalSettings
        }
    };

    const mockLang: ILangContext = {
        lang: ['fr'],
        availableLangs: ['en', 'fr'],
        defaultLang: 'fr',
        setLang: jest.fn()
    };

    const mockUserContext: IUserContext = {
        userData: {
            userId: '123',
            userWhoAmI: {
                ...mockRecord
            }
        },
        setUserData: jest.fn()
    };

    return (
        <MockedProviderWithFragments mocks={apolloMocks} cacheSettings={cacheSettings}>
            <MockStore state={storeState}>
                <LangContext.Provider value={mockLang}>
                    <UserContext.Provider value={mockUserContext}>
                        <ApplicationContext.Provider value={appContextData}>
                            {children ?? <></>}
                        </ApplicationContext.Provider>
                    </UserContext.Provider>
                </LangContext.Provider>
            </MockStore>
        </MockedProviderWithFragments>
    );
};

// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui: ReactElement, options?: ICustomRenderOptions): RenderResult => render(ui, {wrapper: props => <Providers {...props} {...options} />, ...options});

// Re-export everything from testing-library to improve DX. You can everything you need from this file when you use this
// custom render
export * from '@testing-library/react';
export {renderWithProviders as render};
