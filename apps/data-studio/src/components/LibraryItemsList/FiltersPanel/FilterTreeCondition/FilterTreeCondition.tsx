// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dropdown} from 'antd';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {useTranslation} from 'react-i18next';
import {IFilterTree, TreeConditionFilter} from '../../../../_types/types';
import FilterDropdownButton from '../FilterDropdownButton';
import {getTreeConditionOptions} from '../FiltersOptions';

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

    const menu = {
        items: conditionOptions.map(condition => ({
            key: condition.value,
            onClick: () => handleOperatorChange(condition.value),
            label: condition.text
        }))
    };

    return (
        <Dropdown disabled={!filter.active} menu={menu} trigger={['click']}>
            <FilterDropdownButton data-testid="filter-condition-dropdown">
                {conditionOptions.filter(c => c.value === filter.condition)[0].text}
            </FilterDropdownButton>
        </Dropdown>
    );
};

export default FilterTreeCondition;
