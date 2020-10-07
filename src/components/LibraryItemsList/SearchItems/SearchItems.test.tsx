import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import {StateItemsContext} from '../../../Context/StateItemsContext';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import SearchItems from './SearchItems';

describe('SearchItems', () => {
    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should use dispatchItems when form submit', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <StateItemsContext.Provider
                        value={{
                            stateItems: {...LibraryItemListInitialState},
                            dispatchItems
                        }}
                    >
                        <SearchItems />
                    </StateItemsContext.Provider>
                </MockedProviderWithFragments>
            );

            await wait();

            comp.update();
        });

        expect(comp.find('Input')).toHaveLength(1);
        comp.find('Input').simulate('submit');
    });
});
