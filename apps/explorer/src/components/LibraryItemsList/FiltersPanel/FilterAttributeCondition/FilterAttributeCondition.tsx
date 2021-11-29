// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Select, Divider} from 'antd';
import BooleanFilter from 'components/LibraryItemsList/DisplayTypeSelector/FilterInput/BooleanFilter';
import {formatNotUsingCondition} from 'constants/constants';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {allowedTypeOperator, getAttributeFromKey} from '../../../../utils';
import {AttributeConditionFilter, AttributeFormat, AttributeType, IFilter} from '../../../../_types/types';
import {getAttributeConditionOptions} from '../FiltersOptions';
import {checkTypeIsLink} from 'utils';

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

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    // show through condition if attribute is a link and its zero depth
    const showthroughCondition =
        checkTypeIsLink(filter.attribute?.type) && typeof filter.attribute?.parentAttribute === 'undefined';

    const attributeConditionOptions = getAttributeConditionOptions(t);

    const conditionOptionsByType = attributeConditionOptions.filter(
        conditionOption =>
            (conditionOption.value === AttributeConditionFilter.THROUGH && showthroughCondition) ||
            (filter.attribute.format && allowedTypeOperator[filter.attribute.format]?.includes(conditionOption.value))
    );

    const handleOperatorChange = (e: any) => {
        const newFilters = searchState.filters.map(f => {
            if (f.index === filter.index) {
                return {
                    ...filter,
                    condition: AttributeConditionFilter[e]
                };
            }
            return f;
        });

        searchDispatch({type: SearchActionTypes.SET_FILTERS, filters: newFilters});
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
                    {conditionOptionsByType
                        .filter(c => c.value !== AttributeConditionFilter.THROUGH || showthroughCondition)
                        .map(condition => (
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
