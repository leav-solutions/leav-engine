// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
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
        await act(async () => {
            render(
                <MockStore>
                    <SearchModal libId="libId" visible={true} setVisible={jest.fn()} submitAction={jest.fn()} />
                </MockStore>
            );
        });

        expect(screen.getByText('LibraryItemsList')).toBeInTheDocument();
    });
});
