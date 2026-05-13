import {InMemoryCache, type InMemoryCacheConfig} from '@apollo/client';
import {MockedProvider, type MockedProviderProps} from '@apollo/client/testing';
import {type PropsWithChildren, type ReactElement} from 'react';

export interface IMockedProviderWithFragmentsProps extends MockedProviderProps {
    cacheSettings?: InMemoryCacheConfig;
}

function MockedProviderWithFragments({
    children,
    cacheSettings,
    ...props
}: PropsWithChildren<IMockedProviderWithFragmentsProps>) {
    // Set a new cache for each test to avoid fetching data in cache and not in provided mocks
    const mockCache = new InMemoryCache(cacheSettings);
    return (
        <MockedProvider cache={mockCache} {...props}>
            {children as ReactElement}
        </MockedProvider>
    );
}

export default MockedProviderWithFragments;
