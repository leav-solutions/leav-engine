import ApplicationContext from '../context/CurrentApplicationContext';
import {MemoryRouter, type MemoryRouterProps} from 'react-router-dom';
import {mockApplicationDetails} from '../__mocks__/common/applications';
import MockedLangContextProvider from '../__mocks__/MockedLangContextProvider';
import MockedProviderWithFragments from '../__mocks__/MockedProviderWithFragments';
import MockedUserContextProvider from '../__mocks__/MockedUserContextProvider';
import {MockStore} from '../__mocks__/reduxProvider';
import {type ICurrentApplicationContext} from '../context/CurrentApplicationContext/_types';
import {type PropsWithChildren, type ReactElement} from 'react';
import {type InMemoryCacheConfig} from '@apollo/client';
import {type MockedResponse} from '@apollo/client/testing';
import {type RootState} from '../reduxStore/store';
import {type GET_GLOBAL_SETTINGS_globalSettings} from '../_gqlTypes/GET_GLOBAL_SETTINGS';
import {KitApp} from 'aristid-ds';

interface IProvidersProps {
    apolloMocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    routerProps?: MemoryRouterProps;
    /** Opt out of wrapping in MemoryRouter — for components that provide their own router (e.g. RouterProvider). */
    noRouter?: boolean;
    storeState?: Partial<RootState>;
    globalSettings?: GET_GLOBAL_SETTINGS_globalSettings;
    userPermissions?: {[permName: string]: boolean};
}

export const TestProviders = ({
    children,
    apolloMocks,
    cacheSettings,
    routerProps,
    noRouter,
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
                            <KitApp>
                                {noRouter ? (
                                    (children as ReactElement)
                                ) : (
                                    <MemoryRouter
                                        future={{v7_startTransition: true, v7_relativeSplatPath: true}}
                                        {...routerProps}
                                    >
                                        {children as ReactElement}
                                    </MemoryRouter>
                                )}
                            </KitApp>
                        </ApplicationContext.Provider>
                    </MockedUserContextProvider>
                </MockedLangContextProvider>
            </MockedProviderWithFragments>
        </MockStore>
    );
};
