// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCacheConfig} from '@apollo/client';
import {MockedResponse} from '@apollo/client/testing';
import {render, RenderOptions, RenderResult} from '@testing-library/react';
import ApplicationContext from 'context/ApplicationContext';
import {IApplicationContext} from 'context/ApplicationContext/_types';
import {PropsWithChildren, ReactElement} from 'react';
import {RootState} from 'redux/store';
import {GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {GET_GLOBAL_SETTINGS_globalSettings} from '_gqlTypes/GET_GLOBAL_SETTINGS';
import {mockApplicationDetails} from '__mocks__/common/applications';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';

export interface ICustomRenderOptions extends RenderOptions {
    apolloMocks?: readonly MockedResponse[];
    storeState?: Partial<RootState>;
    cacheSettings?: InMemoryCacheConfig;
    currentApp?: GET_APPLICATION_BY_ID_applications_list;
    [key: string]: any;
}

interface IProvidersProps {
    apolloMocks?: readonly MockedResponse[];
    storeState?: Partial<RootState>;
    cacheSettings?: InMemoryCacheConfig;
    currentApp?: GET_APPLICATION_BY_ID_applications_list;
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

    return (
        <MockedProviderWithFragments mocks={apolloMocks} cacheSettings={cacheSettings}>
            <MockStore state={storeState}>
                <ApplicationContext.Provider value={appContextData}>{children ?? <></>}</ApplicationContext.Provider>
            </MockStore>
        </MockedProviderWithFragments>
    );
};

// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui: ReactElement, options?: ICustomRenderOptions): RenderResult =>
    render(ui, {wrapper: props => <Providers {...props} {...options} />, ...options});

// Re-export everything from testing-library to improve DX. You can everything you need from this file when you use this
// custom render
export * from '@testing-library/react';
export {renderWithProviders as render};
