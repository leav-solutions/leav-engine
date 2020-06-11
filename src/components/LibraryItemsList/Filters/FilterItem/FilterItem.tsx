import React from 'react';
import {Button, Checkbox, Dropdown, DropdownProps, Form, Grid, TextArea, TextAreaProps} from 'semantic-ui-react';
import styled from 'styled-components';
import {IFilters, whereFilter} from '../../../../_types/types';

const Attribute = styled.div`
    overflow: hidden;
`;

interface IFilterItemProps {
    filter: IFilters;
    setFilters: React.Dispatch<React.SetStateAction<IFilters[]>>;
    whereOptions: Array<any>;
    operatorOptions: Array<any>;
}

function FilterItem({filter, setFilters, whereOptions, operatorOptions}: IFilterItemProps): JSX.Element {
    const changeActive = () => {
        setFilters(filters => {
            const restFilters = filters.filter(f => f.key !== filter.key);
            const currentFilter = filters.find(f => f.key === filter.key);
            return currentFilter
                ? [...restFilters, {...currentFilter, active: !currentFilter.active}].sort((f1, f2) => f1.key - f2.key)
                : restFilters;
        });
    };

    const deleteFilterItem = () => {
        setFilters(filters => {
            const final = filters.filter(f => f.key !== filter.key);

            if (final.length && final[0].operator) {
                delete final[0].operator;
            }

            return final;
        });
    };

    const updateFilterValue = (event: React.FormEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
        const newValue = (data?.value ?? '').toString();

        setFilters(filters => {
            const restFilters = filters.filter(f => f.key !== filter.key);
            const currentFilter = filters.find(f => f.key === filter.key);
            return currentFilter
                ? [...restFilters, {...currentFilter, value: newValue}].sort((f1, f2) => f1.key - f2.key)
                : restFilters;
        });
    };

    const changeWhere = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const newWhere = (data?.value ?? '').toString();

        setFilters(filters => {
            const restFilters = filters.filter(f => f.key !== filter.key);
            const currentFilter = filters.find(f => f.key === filter.key);
            return currentFilter
                ? [...restFilters, {...currentFilter, where: whereFilter[newWhere]}].sort((f1, f2) => f1.key - f2.key)
                : restFilters;
        });
    };

    return (
        <Grid.Row key={filter.key}>
            <Grid.Column width="1">
                <Checkbox checked={filter.active} onChange={changeActive} />
            </Grid.Column>

            <Grid.Column width="3">
                {filter.operator && (
                    <Dropdown floating inline defaultValue={filter.operator} options={operatorOptions} />
                )}
            </Grid.Column>

            <Grid.Column width="4">
                <Dropdown floating inline defaultValue={filter.where} onChange={changeWhere} options={whereOptions} />
            </Grid.Column>
            <Grid.Column width="5">
                <Attribute>{filter.attribute}</Attribute>
            </Grid.Column>
            <Grid.Column width="1">
                <Button icon="remove" basic negative compact size="mini" onClick={deleteFilterItem} />
            </Grid.Column>

            <Grid.Column width="16">
                <Form>
                    <TextArea value={filter.value} onChange={updateFilterValue} />
                </Form>
            </Grid.Column>
        </Grid.Row>
    );
}

export default FilterItem;
