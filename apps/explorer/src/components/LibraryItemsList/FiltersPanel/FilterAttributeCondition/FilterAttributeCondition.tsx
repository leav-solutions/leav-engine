// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dropdown, Menu, Button, Tooltip, Typography} from 'antd';
import {DownOutlined} from '@ant-design/icons';
import BooleanFilter from 'components/LibraryItemsList/DisplayTypeSelector/FilterInput/BooleanFilter';
import {formatNotUsingCondition} from 'constants/constants';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {limitTextSize, allowedTypeOperator, checkTypeIsLink} from 'utils';
import {
    AttributeConditionFilter,
    AttributeFormat,
    AttributeType,
    FilterType,
    IFilterAttribute,
    IFilterLibrary,
    ThroughConditionFilter
} from '../../../../_types/types';
import {getAttributeConditionOptions} from '../FiltersOptions';

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
        typeof (filter as IFilterAttribute).parentTreeLibrary === 'undefined';

    const attributeConditionOptions = getAttributeConditionOptions(t);

    const conditionOptionsByType = attributeConditionOptions.filter(
        conditionOption =>
            (conditionOption.value === AttributeConditionFilter.THROUGH && showthroughCondition) ||
            (filter.type === FilterType.LIBRARY &&
                allowedTypeOperator[AttributeFormat.text].includes(conditionOption.value)) ||
            ((filter as IFilterAttribute).attribute?.format &&
                allowedTypeOperator[(filter as IFilterAttribute).attribute.format]?.includes(conditionOption.value))
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
                    <>
                        {condition.value === AttributeConditionFilter.THROUGH && <Menu.Divider />}
                        <Menu.Item key={condition.value} onClick={() => handleOperatorChange(condition.value)}>
                            {condition.text}
                        </Menu.Item>
                    </>
                ))}
        </Menu>
    );

    if (showStandardCondition) {
        return (
            <Dropdown disabled={!filter.active} overlay={menu} trigger={['click']}>
                <Button data-testid="filter-condition-dropdown" type={'text'} icon={<DownOutlined />}>
                    <Tooltip
                        mouseEnterDelay={0.5}
                        placement="bottom"
                        title={conditionOptionsByType.filter(c => c.value === filter.condition)[0].text}
                    >
                        <Typography.Text>
                            {limitTextSize(
                                conditionOptionsByType.filter(c => c.value === filter.condition)[0].text,
                                12
                            )}
                        </Typography.Text>
                    </Tooltip>
                </Button>
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
