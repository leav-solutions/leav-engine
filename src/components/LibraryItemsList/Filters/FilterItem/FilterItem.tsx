import React from 'react';
import {Button, Checkbox, Dropdown, Form, Grid, TextArea} from 'semantic-ui-react';
import {IFilters} from '../../../../_types/types';

interface IFilterItemProps {
    filter: IFilters;
    whereOptions: Array<any>;
    operatorOptions: Array<any>;
}

function FilterItem({filter, whereOptions, operatorOptions}: IFilterItemProps): JSX.Element {
    return (
        <Grid.Row key={filter.key}>
            <Grid.Column width="1">
                <Checkbox />
            </Grid.Column>

            <Grid.Column width="4">
                {filter.operator && (
                    <Dropdown floating inline defaultValue={filter.operator} options={operatorOptions} />
                )}
            </Grid.Column>

            <Grid.Column width="4">
                <Dropdown floating inline defaultValue={filter.where} options={whereOptions} />
            </Grid.Column>
            <Grid.Column width="4">{filter.attribute}</Grid.Column>
            <Grid.Column width="1">
                <Button icon="remove" basic negative compact size="mini" />
            </Grid.Column>

            <Grid.Column width="16">
                <Form>
                    <TextArea value={filter.value} />
                </Form>
            </Grid.Column>
        </Grid.Row>
    );
}

export default FilterItem;
