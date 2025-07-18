// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* eslint-disable react-refresh/only-export-components */
import {FunctionComponent, PropsWithChildren, ReactElement} from 'react';
import {render, RenderOptions, RenderResult} from '@testing-library/react';
import {ILangContext, LangContext} from '@leav/ui';
import {InMemoryCache, InMemoryCacheConfig} from '@apollo/client';
import {MockedProvider, MockedProviderProps, MockedResponse} from '@apollo/client/testing';

export interface ICustomRenderOptions extends RenderOptions {
    apolloMocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    [key: string]: any;
}

interface IProvidersProps {
    apolloMocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    globalSettings?: {
        name: string;
        icon: {
            id: string;
            whoAmI: {
                id: string;
                label: string | null;
                subLabel: string | null;
                color: string | null;
                library: {
                    id: string;
                    label: Record<string, string | null> | null;
                    gqlNames: {
                        query: string;
                        type: string;
                    };
                };
            };
        } | null;
    };
}

interface IMockedProviderWithFragmentsProps extends MockedProviderProps {
    cacheSettings?: InMemoryCacheConfig;
}

const MockedProviderWithFragments: FunctionComponent<PropsWithChildren<IMockedProviderWithFragmentsProps>> = ({
    children,
    cacheSettings,
    ...props
}) => {
    // Set a new cache for each test to avoid fetching data in cache and not in provided mocks
    const mockCache = new InMemoryCache(cacheSettings);
    return (
        <MockedProvider cache={mockCache} addTypename {...props}>
            {children as ReactElement}
        </MockedProvider>
    );
};

const Providers: FunctionComponent<PropsWithChildren<IProvidersProps>> = ({children, apolloMocks, cacheSettings}) => {
    const mockLang: ILangContext = {
        lang: ['fr'],
        availableLangs: ['en', 'fr'],
        defaultLang: 'fr',
        setLang: jest.fn()
    };

    return (
        <MockedProviderWithFragments mocks={apolloMocks} cacheSettings={cacheSettings}>
            <LangContext.Provider value={mockLang}>{children ?? <></>}</LangContext.Provider>
        </MockedProviderWithFragments>
    );
};

// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui: ReactElement, options?: ICustomRenderOptions): RenderResult =>
    render(ui, {wrapper: props => <Providers {...props} {...options} />, ...options});

// Re-export everything from testing-library to improve DX. You can get everything you need from this file when you use this custom render
export * from '@testing-library/react';
export {renderWithProviders as render};
