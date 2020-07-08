import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Checkbox} from 'semantic-ui-react';
import {AttributeFormat, AttributeType, DisplayListItemTypes, IAttribute, OrderSearch} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
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
        displayType: DisplayListItemTypes.listSmall,
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
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {
                    fr: 'test',
                    en: 'test'
                },
                isLink: false,
                isMultiple: false
            }
        ];
        const stateMock = {...stateItems, attributes: attributesMock};

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <ChooseTableColumns
                        stateItems={stateMock}
                        dispatchItems={dispatchItems}
                        openChangeColumns={true}
                        setOpenChangeColumns={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Checkbox)).toHaveLength(1);
    });
});
