// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Select} from 'antd';
import BooleanFilter from 'components/LibraryItemsList/DisplayTypeSelector/FilterInput/BooleanFilter';
import {formatNotUsingCondition} from 'constants/constants';
import {setFilters} from 'hooks/FiltersStateHook/FilterReducerAction';
import useStateFilters from 'hooks/FiltersStateHook/FiltersStateHook';
import useSearchReducer from 'hooks/useSearchReducer';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {allowedTypeOperator, getAttributeFromKey} from '../../../../utils';
import {AttributeConditionFilter, AttributeFormat, IFilter} from '../../../../_types/types';
import {getAttributeConditionOptions} from '../FiltersOptions';

const Wrapper = styled.span`
    padding: 3px 8px;
    height: 100%;
    display: grid;
    place-items: center;

    .select-filter-condition {
        text-decoration: underline;
    }
`;

const BooleanWrapper = styled.span`
    padding: 0 1rem;
    height: 100%;
    display: grid;
    place-items: center;
`;

interface IFilterAttributeConditionProps {
    filter: IFilter;
    updateFilterValue: (newValue: any) => void;
}

const FilterAttributeCondition = ({filter, updateFilterValue}: IFilterAttributeConditionProps) => {
    const {t} = useTranslation();

    const {state: searchState} = useSearchReducer();
    const {stateFilters, dispatchFilters} = useStateFilters();

    const attribute = getAttributeFromKey(filter.key, searchState.library.id, searchState.attributes);

    if (!attribute) {
        return <div>error</div>;
    }

    const conditionOptions = getAttributeConditionOptions(t);
    const conditionOptionsByType = conditionOptions.filter(
        conditionOption => attribute.format && allowedTypeOperator[attribute.format]?.includes(conditionOption.value)
    );

    const handleOperatorChange = (e: any) => {
        const newFilters = stateFilters.filters.map(f => {
            if (f.index === filter.index) {
                return {
                    ...filter,
                    condition: AttributeConditionFilter[e]
                };
            }
            return f;
        });

        dispatchFilters(setFilters(newFilters));
    };

    const showStandardCondition = !formatNotUsingCondition.find(format => format === filter.attribute.format);

    if (showStandardCondition) {
        return (
            <Wrapper>
                <Select
                    className="select-filter-condition"
                    bordered={false}
                    value={filter.condition}
                    onChange={handleOperatorChange}
                    data-testid="filter-condition-select"
                >
                    {conditionOptionsByType.map(condition => (
                        <Select.Option key={condition.value} value={condition.value}>
                            <span>{condition.text}</span>
                        </Select.Option>
                    ))}
                </Select>
            </Wrapper>
        );
    } else {
        switch (filter.attribute.format) {
            case AttributeFormat.boolean:
                return (
                    <BooleanWrapper>
                        <BooleanFilter filter={filter} updateFilterValue={updateFilterValue} />
                    </BooleanWrapper>
                );
            default:
                return <></>;
        }
    }
};

export default FilterAttributeCondition;
