import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IItem} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import ChooseTableColumns from './ChooseTableColumns';
import LibraryItemsListTable from './LibraryItemsListTable';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';

jest.mock(
    './ChooseTableColumns',
    () =>
        function ChooseTableColumns() {
            return <div>ChooseTableColumns</div>;
        }
);

jest.mock(
    './LibraryItemsListTableRow',
    () =>
        function LibraryItemsListTableRow() {
            return (
                <tr>
                    <td>LibraryItemsListTableRow</td>
                </tr>
            );
        }
);

jest.mock(
    '../LibraryItemsListPagination',
    () =>
        function LibraryItemsListPagination() {
            return <div>LibraryItemsListPagination</div>;
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
                    <LibraryItemsListTable stateItems={stateMock} dispatchItems={dispatchItems} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(ChooseTableColumns)).toHaveLength(1);
        expect(comp.find(LibraryItemsListTableRow)).toHaveLength(1);
        expect(comp.find(LibraryItemsListPagination)).toHaveLength(1);
    });
});
