import {shallow} from 'enzyme';
import React from 'react';
import {AttributeFormat, displayListItemTypes, IAttribute, OrderSearch} from '../../../../_types/types';
import {LibraryItemListReducerAction, LibraryItemListState} from '../../LibraryItemsListReducer';
import ChooseTableColumns from './ChooseTableColumns';

describe('ChooseTableColumns', () => {
    const stateItems: LibraryItemListState = {
        libQuery: 'test',
        libFilter: 'test',
        libSearchableField: 'test',
        itemsSortField: 'test',
        itemsSortOrder: OrderSearch.asc,
        itemsTotalCount: 0,
        offset: 0,
        pagination: 20,
        displayType: displayListItemTypes.listSmall,
        showFilters: false,
        selectionMode: false,
        itemsSelected: {},
        queryFilters: [],
        attributes: [],
        columns: []
    };

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should render attributes', async () => {
        const attributesMock: IAttribute[] = [
            {
                id: 'string',
                type: 'string',
                format: AttributeFormat.text,
                label: {
                    fr: 'test',
                    en: 'test'
                }
            }
        ];
        const stateMock = {...stateItems, attributes: attributesMock};

        const comp = shallow(
            <ChooseTableColumns
                stateItems={stateMock}
                dispatchItems={dispatchItems}
                openChangeColumns={false}
                setOpenChangeColumns={jest.fn()}
            />
        );

        expect(comp.find('Checkbox')).toHaveLength(1);
    });
});
