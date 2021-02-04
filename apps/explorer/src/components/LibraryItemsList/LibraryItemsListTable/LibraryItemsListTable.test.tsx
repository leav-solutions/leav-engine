// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IItem} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import LibraryItemsListTable from './LibraryItemsListTable';

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

describe('LibraryItemsListTable', () => {
    const stateItems = LibraryItemListInitialState;
    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('check child exist', async () => {
        const itemsMock: IItem[] = [
            {
                id: 'test'
            }
        ];

        const stateMock = {...stateItems, items: itemsMock};

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <LibraryItemsListTable
                        stateItems={{...stateMock, itemsLoading: false}}
                        dispatchItems={dispatchItems}
                    />
                </MockedProviderWithFragments>
            );
        });
        expect(comp.html()).toContain('<table');
        expect(comp.find('LibraryItemsModal')).toHaveLength(1);
    });
});
