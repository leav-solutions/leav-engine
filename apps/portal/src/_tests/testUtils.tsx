// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache, InMemoryCacheConfig} from '@apollo/client';
import {MockedProvider, MockedResponse} from '@apollo/client/testing';
import {MockedLangContextProvider} from '@leav/ui';
import {render, RenderOptions, RenderResult} from '@testing-library/react';
import {KitApp} from 'aristid-ds';
import ApplicationContext from 'context/ApplicationContext';
import {IApplicationContext} from 'context/ApplicationContext/_types';
import {PropsWithChildren, ReactElement} from 'react';
import {GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {GET_GLOBAL_SETTINGS_globalSettings} from '_gqlTypes/GET_GLOBAL_SETTINGS';
import {mockApplication} from './mocks/applications';

interface ICustomRenderOptions extends RenderOptions {
    apolloMocks?: readonly MockedResponse[];
    currentApp?: GET_APPLICATION_BY_ID_applications_list;
    cacheSettings?: InMemoryCacheConfig;
    [key: string]: any;
}

interface IProvidersProps {
    apolloMocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    currentApp?: GET_APPLICATION_BY_ID_applications_list;
    globalSettings?: GET_GLOBAL_SETTINGS_globalSettings;
}

// eslint-disable-next-line react-refresh/only-export-components
const Providers = ({
    children,
    apolloMocks,
    cacheSettings,
    currentApp,
    globalSettings
}: PropsWithChildren<IProvidersProps>) => {
    const mockCache = new InMemoryCache(cacheSettings);

    const appContextData: IApplicationContext = {
        currentApp: currentApp ?? mockApplication,
        globalSettings: {
            name: 'My App',
            icon: null,
            ...globalSettings
        }
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

// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui: ReactElement, options?: ICustomRenderOptions): RenderResult =>
    render(ui, {wrapper: props => <Providers {...props} {...options} />, ...options});

// Re-export everything from testing-library to improve DX. You can everything you need from this file when you use this
// custom render
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export {renderWithProviders as render};
