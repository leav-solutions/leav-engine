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
import {allowedTypeOperator} from '../../../../utils';
import {IFilters, operatorFilter, whereFilter} from '../../../../_types/types';

const Attribute = styled.div`
    overflow: hidden;
`;

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const TextAreaWrapper = styled.div`
    margin: 1rem 0 0 0;
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

    const whereOptionsByType = whereOptions.filter(whereOption =>
        allowedTypeOperator[filter.type]?.includes(whereOption.value)
    );

    const changeActive = () => {
        setFilters(filters => {
            const restFilters = filters.filter(f => f.key !== filter.key);
            const currentFilter = filters.find(f => f.key === filter.key);

            const newFilters = currentFilter
                ? [...restFilters, {...currentFilter, active: !currentFilter.active}].sort((f1, f2) => f1.key - f2.key)
                : restFilters;

            let firstFind = false;

            const newNewFilters = newFilters.map(f => {
                if (!firstFind && f.active) {
                    if (f.operator) {
                        delete f.operator;
                    }
                    firstFind = true;
                } else if (firstFind && !f.operator) {
                    f.operator = operatorFilter.and;
                }

                return f;
            });

            return newNewFilters;
        });
    };

    const deleteFilterItem = () => {
        setFilters(filters => {
            let newFilters = filters.filter(f => f.key !== filter.key);
            const activeFilters = filters.filter(f => f.active);

            if (activeFilters.length && activeFilters[0].operator) {
                newFilters = newFilters.map(f => {
                    if (f.key === activeFilters[0].key) {
                        delete f.operator;
                    }
                    return f;
                });
            } else if (!activeFilters.length) {
                resetFilters();
            }

            return newFilters;
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

    const handleOperatorChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const newOperator = (data.value as operatorFilter) ?? operatorFilter.and;

        setFilters(filters => {
            const restFilters = filters.filter(f => f.key !== filter.key);
            const currentFilter = filters.find(f => f.key === filter.key);
            return currentFilter
                ? [...restFilters, {...currentFilter, operator: newOperator}].sort((f1, f2) => f1.key - f2.key)
                : restFilters;
        });
    };

    return (
        <Segment secondary disabled={!filter.active}>
            <Grid columns={3} verticalAlign="top">
                <Grid.Row key={filter.key}>
                    <Grid.Column width="1">
                        <Checkbox checked={filter.active} onChange={changeActive} />
                    </Grid.Column>

                    <Grid.Column width="12">
                        <Wrapper>
                            {filter.operator ? (
                                <Dropdown
                                    floating
                                    inline
                                    defaultValue={filter.operator}
                                    options={operatorOptions}
                                    onChange={handleOperatorChange}
                                />
                            ) : (
                                t('filter-item.no-operator')
                            )}

                            <Attribute>{filter.attribute}</Attribute>

                            <Dropdown
                                floating
                                inline
                                defaultValue={filter.where}
                                onChange={changeWhere}
                                options={whereOptionsByType}
                                direction="left"
                            />
                        </Wrapper>
                    </Grid.Column>

                    <Grid.Column width="1">
                        <Button icon="remove" basic negative compact size="mini" onClick={deleteFilterItem} />
                    </Grid.Column>

                    <Grid.Column width="16">
                        <Form>
                            <TextAreaWrapper>
                                <TextArea
                                    ref={textAreaRef}
                                    rows={textAreaRows}
                                    value={filter.value}
                                    onChange={updateFilterValue}
                                />
                            </TextAreaWrapper>
                        </Form>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    );
}

export default FilterItem;
