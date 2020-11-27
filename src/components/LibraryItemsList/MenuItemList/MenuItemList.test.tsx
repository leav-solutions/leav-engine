import {Button} from 'antd';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import MenuItemList from './MenuItemList';

jest.mock('../MenuSelection', () => {
    return function MenuSelection() {
        return <div>MenuSelection</div>;
    };
});

describe('MenuItemList', () => {
    const stateItems = LibraryItemListInitialState;

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should have button show filter', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MenuItemList
                        stateItems={{...stateItems, showFilters: false}}
                        dispatchItems={dispatchItems}
                        refetch={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Button).first().prop('name')).toBe('show-filter');
    });

    test("shouldn't have button show filter", async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MenuItemList
                        stateItems={{...stateItems, showFilters: false}}
                        dispatchItems={dispatchItems}
                        refetch={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Button).first().prop('name')).toBe('show-filter');
    });

    test('should have change column button', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MenuItemList
                        stateItems={{...stateItems, showFilters: false}}
                        dispatchItems={dispatchItems}
                        refetch={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Button).at(2).prop('name')).toBe('show-change-column');
    });
});
