// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCacheConfig} from '@apollo/client';
import {MockedResponse} from '@apollo/client/testing';
import {ILangContext, LangContext} from '@leav/ui';
import {RenderOptions, RenderResult, render} from '@testing-library/react';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import {mockApplicationDetails} from '__mocks__/common/applications';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {GET_APPLICATION_BY_ENDPOINT_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ENDPOINT';
import {GET_GLOBAL_SETTINGS_globalSettings} from '_gqlTypes/GET_GLOBAL_SETTINGS';
import ApplicationContext from 'context/ApplicationContext';
import {IApplicationContext} from 'context/ApplicationContext/_types';
import {PropsWithChildren, ReactElement} from 'react';
import {RootState} from 'reduxStore/store';

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

    return (
        <MockedProviderWithFragments mocks={apolloMocks} cacheSettings={cacheSettings}>
            <MockStore state={storeState}>
                <LangContext.Provider value={mockLang}>
                    <ApplicationContext.Provider value={appContextData}>
                        {children ?? <></>}
                    </ApplicationContext.Provider>
                </LangContext.Provider>
            </MockStore>
        </MockedProviderWithFragments>
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
