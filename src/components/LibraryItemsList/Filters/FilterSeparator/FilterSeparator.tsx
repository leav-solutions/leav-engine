// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {Button, Card, Select} from 'antd';
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

const Wrapper = styled(Card)`
    & > * {
        padding: 8px 16px;
        div {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
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
        <div style={{padding: '0.5rem 0'}}>
            <Wrapper>
                <div>
                    <Select disabled={!separator.active} value={separatorOperator} onChange={e => changeOperator(e)}>
                        {operatorOptions.map(operator => (
                            <Select.Option key={operator.value} value={operator.value}>
                                {operator.text}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button type="default" icon={<CloseOutlined />} size="small" onClick={deleteSeparator} />
                </div>
            </Wrapper>
        </div>
    );
}

export default FilterSeparator;
