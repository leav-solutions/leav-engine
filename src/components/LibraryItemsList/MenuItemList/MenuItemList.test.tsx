// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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

jest.mock('../MenuItemActions', () => {
    return function MenuItemActions() {
        return <div>MenuItemActions</div>;
    };
});

describe('MenuItemList', () => {
    const stateItems = LibraryItemListInitialState;

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should have SelectView', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MenuItemList stateItems={{...stateItems}} dispatchItems={dispatchItems} refetch={jest.fn()} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('SelectView')).toHaveLength(1);
    });

    test('should have button show filter', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MenuItemList stateItems={{...stateItems}} dispatchItems={dispatchItems} refetch={jest.fn()} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Button).at(3).prop('name')).toBe('show-filter');
    });

    test('should have change column button', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MenuItemList stateItems={{...stateItems}} dispatchItems={dispatchItems} refetch={jest.fn()} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('MenuItemActions')).toHaveLength(1);
    });
});
