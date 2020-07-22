import React from 'react';
import {Button, Dropdown, DropdownProps, Segment} from 'semantic-ui-react';
import styled from 'styled-components';
import {IFilter, IFilterSeparator, OperatorFilter} from '../../../../_types/types';

const CustomSegment = styled(Segment)`
    display: flex;
    justify-content: space-between;
    align-items: top;
    &&& {
        margin: 0.5rem 0.2rem;
    }
`;

interface IFilterSeparatorProps {
    separator: IFilterSeparator;
    operatorOptions: {
        text: string;
        value: OperatorFilter;
    }[];
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[]>>;
    separatorOperator: OperatorFilter;
    setSeparatorOperator: React.Dispatch<React.SetStateAction<OperatorFilter>>;
    updateFilters: () => void;
}

function FilterSeparator({
    separator,
    operatorOptions,
    setFilters,
    separatorOperator,
    setSeparatorOperator,
    updateFilters: updateFilter
}: IFilterSeparatorProps): JSX.Element {
    const deleteSeparator = () => {
        setFilters(filters => {
            let restFilter = filters.filter(f => f.key !== separator.key);

            return restFilter;
        });

        // reorder the key of the array
        updateFilter();
    };

    const changeOperator = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        setSeparatorOperator(data.value as OperatorFilter);
    };

    return (
        <CustomSegment secondary disabled={!separator.active}>
            <Dropdown options={operatorOptions} value={separatorOperator} selection onChange={changeOperator} />
            <span>
                <Button icon="remove" basic negative compact size="mini" onClick={deleteSeparator} />
            </span>
        </CustomSegment>
    );
}

export default FilterSeparator;
