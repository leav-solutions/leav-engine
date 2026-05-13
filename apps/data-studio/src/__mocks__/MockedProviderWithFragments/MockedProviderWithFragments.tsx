import {InMemoryCache, type InMemoryCacheConfig} from '@apollo/client';
import {MockedProvider, type MockedProviderProps} from '@apollo/client/testing';
import React from 'react';

export interface IMockedProviderWithFragmentsProps extends MockedProviderProps {
    children?: JSX.Element;
    cacheSettings?: InMemoryCacheConfig;
}

function MockedProviderWithFragments({children, cacheSettings, ...props}: IMockedProviderWithFragmentsProps) {
    // Set a new cache for each test to avoid fetching data in cache and not in provided mocks
    const mockCache = new InMemoryCache(cacheSettings);
    return (
        <MockedProvider cache={mockCache} addTypename {...props}>
            {children}
        </MockedProvider>
    );
}

export default MockedProviderWithFragments;
