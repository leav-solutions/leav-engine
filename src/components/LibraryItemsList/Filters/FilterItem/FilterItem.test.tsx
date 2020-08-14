import {Checkbox, Input, Select} from 'antd';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeFormat, ConditionFilter, FilterTypes, IFilter, OperatorFilter} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListInitialState} from '../../LibraryItemsListReducer';
import FilterItem from './FilterItem';

describe('FilterItem', () => {
    const stateItems = LibraryItemListInitialState;

    const mockFilter: IFilter = {
        type: FilterTypes.filter,
        key: 1,
        operator: false,
        condition: ConditionFilter.contains,
        value: '',
        attributeId: 'test',
        active: true,
        format: AttributeFormat.text
    };

    const conditionOptions = [{text: 'Contains', value: ConditionFilter.contains}];

    const operatorOptions = [{text: 'AND', value: OperatorFilter.and}];

    test('should have a Checkbox', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <FilterItem
                        stateItems={stateItems}
                        filter={mockFilter}
                        conditionOptions={conditionOptions}
                        operatorOptions={operatorOptions}
                        setFilters={jest.fn()}
                        resetFilters={jest.fn()}
                        updateFilters={jest.fn()}
                        filterOperator={OperatorFilter.and}
                        setFilterOperator={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Checkbox)).toHaveLength(1);
    });

    test('should have Dropdown', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <FilterItem
                        stateItems={stateItems}
                        filter={mockFilter}
                        conditionOptions={conditionOptions}
                        operatorOptions={operatorOptions}
                        setFilters={jest.fn()}
                        resetFilters={jest.fn()}
                        updateFilters={jest.fn()}
                        filterOperator={OperatorFilter.and}
                        setFilterOperator={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Select)).toHaveLength(1);
    });

    test('should have a TextArea', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <FilterItem
                        stateItems={stateItems}
                        filter={mockFilter}
                        conditionOptions={conditionOptions}
                        operatorOptions={operatorOptions}
                        setFilters={jest.fn()}
                        resetFilters={jest.fn()}
                        updateFilters={jest.fn()}
                        filterOperator={OperatorFilter.and}
                        setFilterOperator={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Input.TextArea)).toHaveLength(1);
    });
});
