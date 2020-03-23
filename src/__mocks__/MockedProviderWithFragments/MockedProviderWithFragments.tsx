import {MockedProvider} from '@apollo/react-testing';
import {InMemoryCache} from 'apollo-cache-inmemory';
import React from 'react';
import {attributesFragmentMatcher} from '../fragmentMatchers/attributesFragmentMatchers';

function MockedProviderWithFragments({children, ...props}) {
    // Set a new cache for each test to avoid fetching data in cache and not in provided mocks
    const cache = new InMemoryCache({fragmentMatcher: attributesFragmentMatcher});

    return (
        <MockedProvider cache={cache} {...props}>
            {children}
        </MockedProvider>
    );
}

export default MockedProviderWithFragments;
