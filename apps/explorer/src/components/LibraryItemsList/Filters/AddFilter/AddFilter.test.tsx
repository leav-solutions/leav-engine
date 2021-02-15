// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListInitialState} from '../../LibraryItemsListReducer';
import AddFilter from './AddFilter';

jest.mock(
    '../../../AttributesSelectionList',
    () =>
        function AttributesSelectionList() {
            return <div>AttributesSelectionList</div>;
        }
);

describe('AttributeList', () => {
    test('should have a List', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <AddFilter
                        stateItems={LibraryItemListInitialState}
                        dispatchItems={jest.fn()}
                        setFilters={jest.fn()}
                        showAttr
                        setShowAttr={jest.fn()}
                        updateFilters={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );

            await wait();
            comp.update();
        });

        expect(comp.find('AttributesSelectionList')).toHaveLength(1);
    });
});
