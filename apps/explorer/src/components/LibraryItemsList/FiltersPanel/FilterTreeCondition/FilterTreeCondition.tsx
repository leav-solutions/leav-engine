// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dropdown, Menu} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import useSearchReducer from 'hooks/useSearchReducer';
import {TreeConditionFilter, IFilterTree} from '../../../../_types/types';
import {getTreeConditionOptions} from '../FiltersOptions';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import FilterDropdownButton from '../FilterDropdownButton';

interface IFilterTreeConditionProps {
    filter: IFilterTree;
}

const FilterTreeCondition = ({filter}: IFilterTreeConditionProps) => {
    const {t} = useTranslation();
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const conditionOptions = getTreeConditionOptions(t);

    const handleOperatorChange = (e: any) => {
        const newFilters = searchState.filters.map(f => {
            if (f.index === filter.index) {
                return {
                    ...filter,
                    condition: TreeConditionFilter[e]
                };
            }

            return f;
        });

        searchDispatch({type: SearchActionTypes.SET_FILTERS, filters: newFilters});
    };

    const menu = (
        <Menu>
            {conditionOptions.map(condition => (
                <Menu.Item key={condition.value} onClick={() => handleOperatorChange(condition.value)}>
                    {condition.text}
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <Dropdown disabled={!filter.active} overlay={menu} trigger={['click']}>
            <FilterDropdownButton data-testid="filter-condition-dropdown">
                {conditionOptions.filter(c => c.value === filter.condition)[0].text}
            </FilterDropdownButton>
        </Dropdown>
    );
};

export default FilterTreeCondition;
