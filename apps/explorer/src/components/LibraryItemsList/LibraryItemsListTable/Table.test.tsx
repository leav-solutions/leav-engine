// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {itemMock} from '__mocks__/common/item';
import {IItem} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {MockStateItems} from '../../../__mocks__/stateItems/mockStateItems';
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

describe('Table', () => {
    test('check child exist', async () => {
        const itemsMock: IItem[] = [itemMock];

        const stateMock = {items: itemsMock, itemsLoading: false};

        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStateItems stateItems={stateMock}>
                        <Table />
                    </MockStateItems>
                </MockedProviderWithFragments>
            );
        });
        expect(screen.getByRole('table')).toBeInTheDocument();
    });
});
