import {InMemoryCache, type InMemoryCacheConfig} from '@apollo/client';
import {MockedProvider, type MockedResponse} from '@apollo/client/testing';
import {AntApp, KitApp} from 'aristid-ds';
import {type PropsWithChildren} from 'react';
import {MemoryRouter, type MemoryRouterProps} from 'react-router-dom';
import {gqlPossibleTypes} from '_ui/gqlPossibleTypes';
import MockedUserContextProvider from '_ui/testing/MockedUserContextProvider';
import {mockGlobalSettingsQuery} from '../__mocks__/mockQuery/mockGlobalSettingsQuery';
import MockedLangContextProvider from '../testing/MockedLangContextProvider';

interface IProvidersProps {
    mocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    routerProps?: MemoryRouterProps;
}

export const TestProviders = ({children, mocks, cacheSettings, routerProps}: PropsWithChildren<IProvidersProps>) => {
    const mockCache = new InMemoryCache({possibleTypes: gqlPossibleTypes, ...cacheSettings});

    // Prepend the shared GlobalSettings mock so any component fetching it (standard filters, Explorer)
    // always finds a matching response, without every test having to declare it.
    const allMocks = [mockGlobalSettingsQuery, ...(mocks ?? [])];

    return (
        <MockedLangContextProvider>
            <MockedUserContextProvider>
                <MockedProvider mocks={allMocks} cache={mockCache}>
                    <MemoryRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}} {...routerProps}>
                        <AntApp>
                            <KitApp>{children ?? <></>}</KitApp>
                        </AntApp>
                    </MemoryRouter>
                </MockedProvider>
            </MockedUserContextProvider>
        </MockedLangContextProvider>
    );
};
