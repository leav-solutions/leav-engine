// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCacheConfig} from '@apollo/client';
import {MockedResponse} from '@apollo/client/testing';
import {render, RenderOptions, RenderResult} from '@testing-library/react';
import ApplicationContext from 'context/CurrentApplicationContext';
import React, {PropsWithChildren, ReactElement} from 'react';
import {MemoryRouterProps} from 'react-router';
import {MemoryRouter} from 'react-router-dom';
import {RootState} from 'redux/store';
import {mockApplicationDetails} from '__mocks__/common/applications';
import MockedLangContextProvider from '__mocks__/MockedLangContextProvider';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import MockedUserContextProvider from '__mocks__/MockedUserContextProvider';
import {MockStore} from '__mocks__/reduxProvider';

interface ICustomRenderOptions extends RenderOptions {
    apolloMocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    routerProps?: MemoryRouterProps;
    storeState?: Partial<RootState>;
    [key: string]: any;
}

interface IProvidersProps {
    apolloMocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    routerProps?: MemoryRouterProps;
    storeState?: Partial<RootState>;
}

const Providers = ({
    children,
    apolloMocks,
    cacheSettings,
    routerProps,
    storeState
}: PropsWithChildren<IProvidersProps>) => {
    return (
        <MockStore state={storeState}>
            <MockedProviderWithFragments mocks={apolloMocks} cacheSettings={cacheSettings}>
                <MockedLangContextProvider>
                    <MockedUserContextProvider>
                        <ApplicationContext.Provider value={mockApplicationDetails}>
                            <MemoryRouter {...routerProps}>{children as ReactElement}</MemoryRouter>
                        </ApplicationContext.Provider>
                    </MockedUserContextProvider>
                </MockedLangContextProvider>
            </MockedProviderWithFragments>
        </MockStore>
    );
};

// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui: ReactElement, options?: ICustomRenderOptions): RenderResult =>
    render(ui, {wrapper: props => <Providers {...props} {...options} />, ...options});

// Re-export everything from testing-library to improve DX. You can everything you need from this file when you use this
// custom render
export * from '@testing-library/react';
export {renderWithProviders as render};
