import {InMemoryCache, type InMemoryCacheConfig} from '@apollo/client';
import {MockedProvider, type MockedProviderProps} from '@apollo/client/testing';
import {type PropsWithChildren, type ReactElement} from 'react';
import {cacheTypePolicies} from '../../components/app/ApolloHandler/cacheTypePolicies';

export interface IMockedProviderWithFragmentsProps extends MockedProviderProps {
    cacheSettings?: InMemoryCacheConfig;
}

function MockedProviderWithFragments({
    children,
    cacheSettings,
    ...props
}: PropsWithChildren<IMockedProviderWithFragmentsProps>) {
    // Set a new cache for each test to avoid fetching data in cache and not in provided mocks.
    // Reuse the production typePolicies so tests exercise the same merge behaviour (and don't emit
    // "Cache data may be lost" warnings). Per-test cacheSettings can still override them.
    const mockCache = new InMemoryCache({typePolicies: cacheTypePolicies, ...cacheSettings});
    return (
        <MockedProvider cache={mockCache} {...props}>
            {children as ReactElement}
        </MockedProvider>
    );
}

export default MockedProviderWithFragments;
