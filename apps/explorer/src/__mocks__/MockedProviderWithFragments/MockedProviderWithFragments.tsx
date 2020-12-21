// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import React from 'react';

// export const getMockCacheWithFragments = () => new InMemoryCache({fragmentMatcher: attributesFragmentMatcher});
export const getMockCacheWithFragments = () => new InMemoryCache();

function MockedProviderWithFragments({children, ...props}: any) {
    // Set a new cache for each test to avoid fetching data in cache and not in provided mocks
    const mockCache = getMockCacheWithFragments();
    return (
        <MockedProvider cache={mockCache} {...props}>
            {children}
        </MockedProvider>
    );
}

export default MockedProviderWithFragments;
