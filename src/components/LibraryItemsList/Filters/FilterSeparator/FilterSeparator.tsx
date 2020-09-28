import {CloseOutlined} from '@ant-design/icons';
import {Button, Select} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {FilterTypes, IFilter, IFilterSeparator, OperatorFilter} from '../../../../_types/types';

interface IFilterSeparatorProps {
    separator: IFilterSeparator;
    operatorOptions: {
        text: string;
        value: OperatorFilter;
    }[];
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[][]>>;
    separatorOperator: OperatorFilter;
    setSeparatorOperator: React.Dispatch<React.SetStateAction<OperatorFilter>>;
    updateFilters: () => void;
}

const Wrapper = styled.div`
    margin: 0.5rem 0.2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #f0f0f0;
    padding: 12px 12px;
`;

function FilterSeparator({
    separator,
    operatorOptions,
    setFilters,
    separatorOperator,
    setSeparatorOperator,
    updateFilters
}: IFilterSeparatorProps): JSX.Element {
    const deleteSeparator = () => {
        setFilters(filters => {
            let restFilter = filters.map(filterGroup =>
                filterGroup.filter(filter => filter.type !== FilterTypes.separator)
            );

            return restFilter;
        });

        // reorder the key of the array
        updateFilters();
    };

    const changeOperator = (operatorFilter: OperatorFilter) => {
        setSeparatorOperator(operatorFilter);
    };

    return (
        <Wrapper>
            <Select disabled={!separator.active} value={separatorOperator} onChange={e => changeOperator(e)}>
                {operatorOptions.map(operator => (
                    <Select.Option key={operator.value} value={operator.value}>
                        {operator.text}
                    </Select.Option>
                ))}
            </Select>
            <Button type="text" icon={<CloseOutlined />} size="small" onClick={deleteSeparator} />
        </Wrapper>
    );
}

export default FilterSeparator;
