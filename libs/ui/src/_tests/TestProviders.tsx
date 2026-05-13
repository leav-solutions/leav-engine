import {InMemoryCache, type InMemoryCacheConfig} from '@apollo/client';
import {MockedProvider, type MockedResponse} from '@apollo/client/testing';
import {AntApp, KitApp} from 'aristid-ds';
import {type PropsWithChildren} from 'react';
import {MemoryRouter, type MemoryRouterProps} from 'react-router-dom';
import {gqlPossibleTypes} from '_ui/gqlPossibleTypes';
import MockedUserContextProvider from '_ui/testing/MockedUserContextProvider';
import MockedLangContextProvider from '../testing/MockedLangContextProvider';

interface IProvidersProps {
    mocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    routerProps?: MemoryRouterProps;
}

export const TestProviders = ({children, mocks, cacheSettings, routerProps}: PropsWithChildren<IProvidersProps>) => {
    const mockCache = new InMemoryCache({possibleTypes: gqlPossibleTypes, ...cacheSettings});

    return (
        <MockedLangContextProvider>
            <MockedUserContextProvider>
                <MockedProvider mocks={mocks} cache={mockCache}>
                    <MemoryRouter {...routerProps}>
                        <AntApp>
                            <KitApp>{children ?? <></>}</KitApp>
                        </AntApp>
                    </MemoryRouter>
                </MockedProvider>
            </MockedUserContextProvider>
        </MockedLangContextProvider>
    );
};
