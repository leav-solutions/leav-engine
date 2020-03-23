import {MockedProvider} from '@apollo/react-testing';
import {InMemoryCache} from 'apollo-cache-inmemory';
import React from 'react';
import {attributesFragmentMatcher} from '../fragmentMatchers/attributesFragmentMatchers';

export const getMockCacheWithFragments = () => new InMemoryCache({fragmentMatcher: attributesFragmentMatcher});

function MockedProviderWithFragments({children, ...props}) {
    // Set a new cache for each test to avoid fetching data in cache and not in provided mocks
    const mockCache = getMockCacheWithFragments();
    return (
        <MockedProvider cache={mockCache} {...props}>
            {children}
        </MockedProvider>
    );
}

export default MockedProviderWithFragments;
