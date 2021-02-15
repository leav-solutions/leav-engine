// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import {AttributeFormat, ConditionFilter, FilterTypes, IFilter} from '../../../../../_types/types';
import {mockAttributeStandard} from '../../../../../__mocks__/common/attribute';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListInitialState} from '../../../LibraryItemsListReducer';
import ChangeAttribute from './ChangeAttribute';

jest.mock('../../../../AttributesSelectionList', () => {
    return function AttributesSelectionList() {
        return <div>AttributesSelectionList</div>;
    };
});

describe('ChangeAttribute', () => {
    const stateItems = LibraryItemListInitialState;

    const mockFilter: IFilter = {
        id: mockAttributeStandard.id,
        type: FilterTypes.filter,
        key: 1,
        operator: false,
        condition: ConditionFilter.contains,
        value: '',
        attribute: mockAttributeStandard,
        active: true,
        format: AttributeFormat.text
    };

    test('should list attribute', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <ChangeAttribute
                        stateItems={stateItems}
                        setFilters={jest.fn()}
                        filter={mockFilter}
                        showModal={true}
                        setShowModal={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );

            await wait();

            comp.update();
        });

        expect(comp.find('AttributesSelectionList')).toHaveLength(1);
    });
});
