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
import {conditionFilter, FilterTypes, IFilter, IFilterSeparator, operatorFilter} from '../../../../_types/types';

const Attribute = styled.div``;

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: top;
`;

const TextAreaWrapper = styled.div`
    margin: 1rem 0 0 0;
`;

interface IFilterItemProps {
    filter: IFilter;
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[]>>;
    whereOptions: {
        text: string;
        value: conditionFilter;
    }[];
    operatorOptions: {
        text: string;
        value: operatorFilter;
    }[];
    resetFilters: () => void;
    updateFilters: () => void;
    filterOperator: operatorFilter;
    setFilterOperator: React.Dispatch<React.SetStateAction<operatorFilter>>;
}

function FilterItem({
    filter,
    setFilters,
    whereOptions,
    operatorOptions,
    resetFilters,
    updateFilters,
    filterOperator,
    setFilterOperator
}: IFilterItemProps): JSX.Element {
    const {t} = useTranslation();
    const [textAreaRows, setTextAreaRows] = useState<number>(1);

    const textAreaRef = useRef(null);

    const whereOptionsByType = whereOptions.filter(whereOption =>
        allowedTypeOperator[filter.format]?.includes(whereOption.value)
    );

    const changeActive = () => {
        setFilters(filters => {
            const restFilters = filters.filter(f => f.key !== filter.key);
            const currentFilter = filters.find(f => f.key === filter.key);

            let newNewFilters: (IFilter | IFilterSeparator)[] = [];
            if (currentFilter && currentFilter.type === FilterTypes.filter) {
                const newFilters = currentFilter
                    ? [...restFilters, {...currentFilter, active: !currentFilter.active}].sort(
                          (f1, f2) => f1.key - f2.key
                      )
                    : restFilters;

                let firstFind = false;
                newNewFilters = newFilters.map(f => {
                    if (!firstFind && f.type === FilterTypes.filter && f.active) {
                        if (f.operator) {
                            f.operator = false;
                        }
                        firstFind = true;
                    } else if (firstFind && f.type === FilterTypes.filter && !f.operator) {
                        f.operator = true;
                    }

                    return f;
                });
            }

            return newNewFilters;
        });

        updateFilters();
    };

    const deleteFilterItem = () => {
        setFilters(filters => {
            let newFilters = filters.filter(f => f.key !== filter.key);
            const activeFilters = (filters as IFilter[]).filter(f => f.type === FilterTypes.filter && f.active);

            if (activeFilters.length && activeFilters[0].operator) {
                const separators = filters.filter(filter => filter.type === FilterTypes.separator);

                newFilters = newFilters.map(f => {
                    const lastFilterIsSeparatorCondition = separators.some(separator => separator.key === f.key - 1);

                    if (
                        f.type === FilterTypes.filter &&
                        (f.key === activeFilters[0].key || lastFilterIsSeparatorCondition)
                    ) {
                        f.operator = false;
                    }

                    return f;
                });
            } else if (!activeFilters.length) {
                resetFilters();
            }

            return newFilters;
        });

        updateFilters();
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

    const changeCondition = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const newCondition = (data?.value ?? '').toString();

        setFilters(filters => {
            const restFilters = filters.filter(f => f.key !== filter.key);
            const currentFilter = filters.find(f => f.key === filter.key);

            return currentFilter
                ? [...restFilters, {...currentFilter, where: conditionFilter[newCondition]}].sort(
                      (f1, f2) => f1.key - f2.key
                  )
                : restFilters;
        });
    };

    const handleOperatorChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const newOperator = (data.value as operatorFilter) ?? operatorFilter.and;

        setFilterOperator(newOperator);
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
                                    value={filterOperator}
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
                                defaultValue={filter.condition}
                                onChange={changeCondition}
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
