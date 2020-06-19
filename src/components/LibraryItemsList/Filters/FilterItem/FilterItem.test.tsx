import {mount, render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Checkbox, Dropdown, TextArea} from 'semantic-ui-react';
import {AttributeFormat, conditionFilter, FilterTypes, IFilter, operatorFilter} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import FilterItem from './FilterItem';

describe('FilterItem', () => {
    const mockFilter: IFilter = {
        type: FilterTypes.filter,
        key: 1,
        operator: operatorFilter.and,
        condition: conditionFilter.contains,
        value: '',
        attribute: 'test',
        active: true,
        format: AttributeFormat.text
    };

    const whereOptions = [{text: 'Contains', value: conditionFilter.contains}];

    const operatorOptions = [{text: 'AND', value: operatorFilter.and}];

    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <FilterItem
                    filter={mockFilter}
                    whereOptions={whereOptions}
                    operatorOptions={operatorOptions}
                    setFilters={jest.fn()}
                    resetFilters={jest.fn()}
                    updateFilters={jest.fn()}
                    filterOperator={operatorFilter.and}
                    setFilterOperator={jest.fn()}
                />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });

    test('should have a Checkbox', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <FilterItem
                        filter={mockFilter}
                        whereOptions={whereOptions}
                        operatorOptions={operatorOptions}
                        setFilters={jest.fn()}
                        resetFilters={jest.fn()}
                        updateFilters={jest.fn()}
                        filterOperator={operatorFilter.and}
                        setFilterOperator={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Checkbox)).toHaveLength(1);
    });

    test('should have two Dropdown', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <FilterItem
                        filter={mockFilter}
                        whereOptions={whereOptions}
                        operatorOptions={operatorOptions}
                        setFilters={jest.fn()}
                        resetFilters={jest.fn()}
                        updateFilters={jest.fn()}
                        filterOperator={operatorFilter.and}
                        setFilterOperator={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Dropdown)).toHaveLength(2);
    });

    test('should have a TextArea', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <FilterItem
                        filter={mockFilter}
                        whereOptions={whereOptions}
                        operatorOptions={operatorOptions}
                        setFilters={jest.fn()}
                        resetFilters={jest.fn()}
                        filterOperator={operatorFilter.and}
                        setFilterOperator={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(TextArea)).toHaveLength(1);
    });
});
