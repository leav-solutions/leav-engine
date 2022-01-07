// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dropdown, Menu} from 'antd';
import BooleanFilter from 'components/LibraryItemsList/DisplayTypeSelector/FilterInput/BooleanFilter';
import {formatNotUsingCondition} from 'constants/constants';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React, {Fragment} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {checkTypeIsLink} from 'utils';
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {
    AttributeConditionFilter,
    AttributeConditionType,
    FilterType,
    IFilterAttribute,
    IFilterLibrary
} from '../../../../../_types/types';
import FilterDropdownButton from '../../FilterDropdownButton';
import {getConditionOptionsByType} from '../../FiltersOptions';
import mustHideValue from '../../mustHideValue';
import {getDefaultFilterValueByFormat} from '../Filter';

const BooleanWrapper = styled.span`
    padding: 0 1rem;
    height: 100%;
    display: grid;
    place-items: center;
`;

interface IFilterAttributeConditionProps {
    filter: IFilterAttribute | IFilterLibrary;
    updateFilterValue: (newValue: any) => void;
}

const FilterAttributeCondition = ({filter, updateFilterValue}: IFilterAttributeConditionProps) => {
    const {t} = useTranslation();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const showthroughCondition =
        ((filter as IFilterAttribute).attribute?.format === AttributeFormat.extended ||
            filter.type === FilterType.LIBRARY ||
            checkTypeIsLink((filter as IFilterAttribute).attribute?.type) ||
            (filter as IFilterAttribute).attribute?.type === AttributeType.tree) &&
        typeof (filter as IFilterAttribute).attribute?.parentAttribute === 'undefined' &&
        typeof (filter as IFilterAttribute).parentTreeLibrary === 'undefined' &&
        filter.condition !== AttributeConditionFilter.THROUGH;

    const conditionOptionsByType = getConditionOptionsByType(filter, showthroughCondition, t);

    const _handleConditionChange = (condition: AttributeConditionType) => {
        const newFilters = searchState.filters.map(f => {
            if (f.index === filter.index) {
                let newValue = {...filter.value};

                if (mustHideValue(condition)) {
                    newValue = null;
                } else if (
                    newValue === null ||
                    (typeof newValue?.value === 'object' && condition !== AttributeConditionFilter.BETWEEN)
                ) {
                    newValue.value = getDefaultFilterValueByFormat((filter as IFilterAttribute).attribute.format);
                }

                return {
                    ...filter,
                    value: newValue,
                    condition: AttributeConditionFilter[condition]
                };
            }

            return f;
        });

        searchDispatch({type: SearchActionTypes.SET_FILTERS, filters: newFilters});
    };

    const showStandardCondition = !formatNotUsingCondition.find(
        format =>
            (filter.type === FilterType.LIBRARY && format === AttributeFormat.text) ||
            (filter.type === FilterType.ATTRIBUTE && format === (filter as IFilterAttribute).attribute.format)
    );

    const menu = (
        <Menu>
            {conditionOptionsByType
                .filter(c => c.value !== AttributeConditionFilter.THROUGH || showthroughCondition)
                .map(condition => (
                    <Fragment key={condition.value}>
                        {condition.value === AttributeConditionFilter.THROUGH && <Menu.Divider />}
                        <Menu.Item onClick={() => _handleConditionChange(condition.value)}>
                            {condition.textByFormat?.[(filter as IFilterAttribute)?.attribute?.format] ??
                                condition?.text}
                        </Menu.Item>
                    </Fragment>
                ))}
        </Menu>
    );

    if (showStandardCondition) {
        const conditionOption = conditionOptionsByType.filter(c => c.value === filter.condition)[0];
        return (
            <Dropdown
                disabled={!filter.active || filter.condition === AttributeConditionFilter.THROUGH}
                overlay={menu}
                trigger={['click']}
            >
                <FilterDropdownButton aria-label="filter-condition">
                    {conditionOption?.textByFormat?.[(filter as IFilterAttribute)?.attribute?.format] ??
                        conditionOption?.text}
                </FilterDropdownButton>
            </Dropdown>
        );
    } else {
        switch ((filter as IFilterAttribute).attribute.format) {
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
