// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {itemsInitialState} from 'redux/items';
import {itemMock} from '__mocks__/common/item';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {IItem} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import Table from './Table';

jest.mock(
    './ChooseTableColumns',
    () =>
        function ChooseTableColumns() {
            return <div>ChooseTableColumns</div>;
        }
);

jest.mock(
    '../LibraryItemsListPagination',
    () =>
        function LibraryItemsListPagination() {
            return <div>LibraryItemsListPagination</div>;
        }
);

jest.mock(
    './LibraryItemsModal',
    () =>
        function LibraryItemsModal() {
            return <div>LibraryItemsModal</div>;
        }
);

jest.mock(
    './Header',
    () =>
        function Header() {
            return <div>Header</div>;
        }
);

describe('Table', () => {
    test('check child exist', async () => {
        const itemsMock: IItem[] = [itemMock];

        const stateMock = {items: {...itemsInitialState, items: itemsMock, loading: false}};

        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore state={stateMock}>
                        <Table />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });
        expect(screen.getByRole('table')).toBeInTheDocument();
    });
});
