/* eslint-disable react-refresh/only-export-components */
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache, InMemoryCacheConfig} from '@apollo/client';
import {MockedProvider, MockedResponse} from '@apollo/client/testing';
import {render, RenderOptions, RenderResult} from '@testing-library/react';
import {KitApp} from 'aristid-ds';
import {PropsWithChildren, ReactElement} from 'react';
import MockedLangContextProvider from '../testing/MockedLangContextProvider';

interface ICustomRenderOptions extends RenderOptions {
    mocks?: readonly MockedResponse[];
    [key: string]: any;
}

interface IProvidersProps {
    mocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
}

const Providers = ({children, mocks, cacheSettings}: PropsWithChildren<IProvidersProps>) => {
    const mockCache = new InMemoryCache(cacheSettings);

    return (
        <MockedLangContextProvider>
            <MockedProvider mocks={mocks} cache={mockCache} addTypename>
                <KitApp>{children ?? <></>}</KitApp>
            </MockedProvider>
        </MockedLangContextProvider>
    );
};

// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui: ReactElement, options?: ICustomRenderOptions): RenderResult => {
    return render(ui, {wrapper: props => <Providers {...props} {...options} />, ...options});
};

// Re-export everything from testing-library to improve DX. You can everything you need from this file when you use this
// custom render
export * from '@testing-library/react';
export {renderWithProviders as render};
