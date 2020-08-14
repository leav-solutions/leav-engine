import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import {AttributeFormat, ConditionFilter, FilterTypes, IFilter} from '../../../../../_types/types';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import ListAttributes from '../../../../ListAttributes';
import {LibraryItemListInitialState} from '../../../LibraryItemsListReducer';
import ChangeAttribute from './ChangeAttribute';

describe('ChangeAttribute', () => {
    const stateItems = LibraryItemListInitialState;

    const filterMock: IFilter = {
        type: FilterTypes.filter,
        key: 0,
        operator: false,
        condition: ConditionFilter.contains,
        value: '',
        attributeId: 'id',
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
                        filter={filterMock}
                        showModal={true}
                        setShowModal={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );

            await wait();

            comp.update();
        });

        expect(comp.find(ListAttributes)).toHaveLength(1);
    });
});
