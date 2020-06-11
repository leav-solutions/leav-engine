import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    Button,
    Checkbox,
    Dropdown,
    DropdownProps,
    Form,
    Grid,
    Segment,
    TextArea,
    TextAreaProps
} from 'semantic-ui-react';
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
    resetFilters: () => void;
}

function FilterItem({filter, setFilters, whereOptions, operatorOptions, resetFilters}: IFilterItemProps): JSX.Element {
    const {t} = useTranslation();
    const [textAreaRows, setTextAreaRows] = useState<number>(1);

    const textAreaRef = useRef(null);

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
            } else if (!final.length) {
                resetFilters();
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

        const rows = newValue.split('\n').length;

        setTextAreaRows(rows <= 10 ? rows : 10);
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
        <Segment secondary disabled={!filter.active}>
            <Grid columns={3}>
                <Grid.Row key={filter.key}>
                    <Grid.Column width="1">
                        <Checkbox checked={filter.active} onChange={changeActive} />
                    </Grid.Column>

                    <Grid.Column width="3">
                        {filter.operator ? (
                            <Dropdown floating inline defaultValue={filter.operator} options={operatorOptions} />
                        ) : (
                            t('filter-item.no-operator')
                        )}
                    </Grid.Column>

                    <Grid.Column width="5">
                        <Attribute>{filter.attribute}</Attribute>
                    </Grid.Column>

                    <Grid.Column width="4">
                        <Dropdown
                            floating
                            inline
                            defaultValue={filter.where}
                            onChange={changeWhere}
                            options={whereOptions}
                        />
                    </Grid.Column>

                    <Grid.Column width="1">
                        <Button icon="remove" basic negative compact size="mini" onClick={deleteFilterItem} />
                    </Grid.Column>

                    <Grid.Column width="16">
                        <Form>
                            <TextArea
                                ref={textAreaRef}
                                rows={textAreaRows}
                                value={filter.value}
                                onChange={updateFilterValue}
                            />
                        </Form>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    );
}

export default FilterItem;
