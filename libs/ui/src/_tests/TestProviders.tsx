import {InMemoryCache, type InMemoryCacheConfig} from '@apollo/client';
import {MockedProvider, type MockedResponse} from '@apollo/client/testing';
import {AntApp, AntConfigProvider, KitApp} from 'aristid-ds';
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
                <MockedProvider mocks={mocks ?? []} cache={mockCache}>
                    <MemoryRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}} {...routerProps}>
                        <AntApp>
                            {/*
                             * Disable antd motion in tests: happy-dom never fires the CSS
                             * transition/animation end events, so overlays (Dropdown, Select…) would
                             * stay stuck in their "appear-start" state (opacity: 0) and be reported as
                             * not visible by toBeVisible. Setting motion to false makes them render in
                             * their final state synchronously.
                             */}
                            <AntConfigProvider theme={{token: {motion: false}}}>
                                <KitApp>{children ?? <></>}</KitApp>
                            </AntConfigProvider>
                        </AntApp>
                    </MemoryRouter>
                </MockedProvider>
            </MockedUserContextProvider>
        </MockedLangContextProvider>
    );
};
