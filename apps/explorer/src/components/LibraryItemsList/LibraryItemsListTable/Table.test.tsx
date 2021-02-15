// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
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
        const itemsMock: IItem[] = [
            {
                fields: {},
                whoAmI: {
                    id: 'id'
                },
                index: 0
            }
        ];

        const stateMock = {items: itemsMock, itemsLoading: false};

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStateItems stateItems={stateMock}>
                        <Table />
                    </MockStateItems>
                </MockedProviderWithFragments>
            );
        });
        expect(comp.find('CustomTable')).toHaveLength(1);
    });
});
