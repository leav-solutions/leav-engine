import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../../LibraryItemsListReducer';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';

describe('LibraryItemsListTableRow', () => {
    const stateItems = LibraryItemListInitialState;

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should call InfosRow', async () => {
        const itemMock = {
            id: 'test',
            label: 'test'
        };

        const stateMock = {
            ...stateItems,
            columns: [
                {id: 'infos', library: 'test', type: AttributeType.simple},
                {id: 'row1', library: 'test', type: AttributeType.simple},
                {id: 'row2', library: 'test', type: AttributeType.simple}
            ]
        };

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    {/* table and tbody add to avoid warning */}
                    <table>
                        <tbody>
                            <LibraryItemsListTableRow
                                item={itemMock}
                                stateItems={stateMock}
                                dispatchItems={dispatchItems}
                                showRecordEdition={jest.fn()}
                            />
                        </tbody>
                    </table>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('InfosRow')).toHaveLength(1);
        expect(comp.find('Row')).toHaveLength(1);
    });
});
