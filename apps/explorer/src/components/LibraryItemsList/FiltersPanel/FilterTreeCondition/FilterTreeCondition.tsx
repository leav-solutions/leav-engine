// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Select} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import useSearchReducer from 'hooks/useSearchReducer';
import {TreeConditionFilter, IFilter, IFilterTree} from '../../../../_types/types';
import {getTreeConditionOptions} from '../FiltersOptions';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';

const Wrapper = styled.span`
    padding: 3px 8px;
    height: 100%;
    display: grid;
    place-items: center;

    .select-filter-condition {
        text-decoration: underline;
    }
`;

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

    return (
        <Wrapper>
            <Select
                className="select-filter-condition"
                bordered={false}
                value={filter.condition}
                onChange={handleOperatorChange}
                data-testid="filter-condition-select"
            >
                {conditionOptions.map(condition => (
                    <Select.Option key={condition.value} value={condition.value}>
                        <span>{condition.text}</span>
                    </Select.Option>
                ))}
            </Select>
        </Wrapper>
    );
};

export default FilterTreeCondition;
