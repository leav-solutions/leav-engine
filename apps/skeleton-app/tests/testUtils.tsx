// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* eslint-disable react-refresh/only-export-components */
import {FunctionComponent, PropsWithChildren, ReactElement} from 'react';
import {render, RenderOptions, RenderResult} from '@testing-library/react';
import {ILangContext, LangContext} from '@leav/ui';
import {InMemoryCacheConfig} from '@apollo/client';
import {MockedResponse} from '@apollo/client/testing';
import {GET_APPLICATION_BY_ENDPOINT_applications_list} from '../src/_gqlTypes/GET_APPLICATION_BY_ENDPOINT';
import {GET_GLOBAL_SETTINGS_globalSettings} from '../src/_gqlTypes/GET_GLOBAL_SETTINGS';
import MockedProviderWithFragments from '../src/__mocks__/MockedProviderWithFragments';

export interface ICustomRenderOptions extends RenderOptions {
    apolloMocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    currentApp?: GET_APPLICATION_BY_ENDPOINT_applications_list;
    [key: string]: any;
}

interface IProvidersProps {
    apolloMocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    currentApp?: GET_APPLICATION_BY_ENDPOINT_applications_list;
    globalSettings?: GET_GLOBAL_SETTINGS_globalSettings;
}

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
