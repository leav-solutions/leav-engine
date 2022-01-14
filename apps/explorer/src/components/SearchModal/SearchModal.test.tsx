// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import {getLibraryDetailExtendedQuery} from 'graphQL/queries/libraries/getLibraryDetailExtendQuery';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import {
    mockGetLibraryDetailExtendedQuery,
    mockGetLibraryDetailExtendedQueryVar
} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import SearchModal from './SearchModal';

jest.mock(
    'components/LibraryItemsList',
    () =>
        function LibraryItemsList() {
            return <div>LibraryItemsList</div>;
        }
);

describe('SearchModal', () => {
    test('should contain LibraryItemsList', async () => {
        const mocks = [
            {
                request: {
                    query: getLibraryDetailExtendedQuery(100),
                    variables: mockGetLibraryDetailExtendedQueryVar
                },
                result: {
                    data: mockGetLibraryDetailExtendedQuery
                }
            }
        ];

        await act(async () => {
            render(
                <MockedProviderWithFragments mocks={mocks}>
                    <MockStore>
                        <SearchModal libId="test" visible={true} setVisible={jest.fn()} submitAction={jest.fn()} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        await waitForElement(() => screen.getByText('LibraryItemsList'));

        expect(screen.getByText('LibraryItemsList')).toBeInTheDocument();
    });
});
