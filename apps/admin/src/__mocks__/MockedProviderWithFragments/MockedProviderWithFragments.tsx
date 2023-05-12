// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache, InMemoryCacheConfig} from '@apollo/client';
import {MockedProvider, MockedProviderProps} from '@apollo/client/testing';
import React, {PropsWithChildren, ReactElement} from 'react';
import {attributesPossibleTypes} from '../fragmentMatchers/attributesFragmentMatchers';

export interface IMockedProviderWithFragmentsProps extends MockedProviderProps {
    cacheSettings?: InMemoryCacheConfig;
}
export const getMockCacheWithFragments = () => new InMemoryCache({possibleTypes: attributesPossibleTypes});

function MockedProviderWithFragments({
    children,
    cacheSettings,
    ...props
}: PropsWithChildren<IMockedProviderWithFragmentsProps>) {
    // Set a new cache for each test to avoid fetching data in cache and not in provided mocks
    const mockCache = new InMemoryCache(cacheSettings);
    return (
        <MockedProvider cache={mockCache} addTypename {...props}>
            {children as ReactElement}
        </MockedProvider>
    );
}

export default MockedProviderWithFragments;
