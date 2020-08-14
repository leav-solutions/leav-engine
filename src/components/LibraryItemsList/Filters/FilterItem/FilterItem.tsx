import {CloseOutlined} from '@ant-design/icons';
import {Button, Card, Checkbox, Select} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled, {CSSObject} from 'styled-components';
import {allowedTypeOperator} from '../../../../utils';
import {
    AttributeFormat,
    ConditionFilter,
    FilterTypes,
    IFilter,
    IFilterSeparator,
    OperatorFilter
} from '../../../../_types/types';
import {LibraryItemListState} from '../../LibraryItemsListReducer';
import ChangeAttribute from './ChangeAttribute';
import FormBoolean from './FormBoolean';
import FormText from './FormText';

const Grid = styled.div`
    display: flex;
    flex-flow: column;
`;

const GridRow = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
`;

interface GridColumnProps {
    flex?: number;
    style?: CSSObject;
}

const GridColumn = styled.div<GridColumnProps>`
    flex: ${({flex}) => flex ?? 1};
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-around;
    align-items: center;

    &:first-child {
        justify-content: start;
    }

    &:last-child {
        justify-content: end;
    }
`;

const CurrentAttribute = styled.span`
    cursor: pointer;
    background: none;
    padding: 0.5rem;
    border-radius: 0.25rem;

    &:hover {
        background: hsla(0, 0%, 0%, 0.1);
    }
`;

interface IFilterItemProps {
    stateItems: LibraryItemListState;
    filter: IFilter;
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[]>>;
    conditionOptions: {
        text: string;
        value: ConditionFilter;
    }[];
    operatorOptions: {
        text: string;
        value: OperatorFilter;
    }[];
    resetFilters: () => void;
    updateFilters: () => void;
    filterOperator: OperatorFilter;
    setFilterOperator: React.Dispatch<React.SetStateAction<OperatorFilter>>;
}

function FilterItem({
    stateItems,
    filter,
    setFilters,
    conditionOptions,
    operatorOptions,
    resetFilters,
    updateFilters,
    filterOperator,
    setFilterOperator
}: IFilterItemProps): JSX.Element {
    const {t} = useTranslation();

    const [showModal, setShowModal] = useState(false);

    const conditionOptionsByType = conditionOptions.filter(
        conditionOption => filter.format && allowedTypeOperator[filter.format]?.includes(conditionOption.value)
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

    const updateFilterValue = (newValue: any) => {
        setFilters(filters => {
            const restFilters = filters.filter(f => f.key !== filter.key);
            const currentFilter = filters.find(f => f.key === filter.key);
            return currentFilter
                ? [...restFilters, {...currentFilter, value: newValue}].sort((f1, f2) => f1.key - f2.key)
                : restFilters;
        });
    };

    const changeCondition = (conditionFilter: ConditionFilter) => {
        const newCondition = conditionFilter;

        setFilters(filters =>
            filters.reduce((acc, f) => {
                if (f.key === filter.key) {
                    return [...acc, {...filter, condition: newCondition}];
                }
                return [...acc, f];
            }, [] as (IFilter | IFilterSeparator)[])
        );
    };

    const handleOperatorChange = (operatorFilter: OperatorFilter) => {
        const newOperator = operatorFilter ?? OperatorFilter.and;

        setFilterOperator(newOperator);
    };

    return (
        <>
            <ChangeAttribute
                stateItems={stateItems}
                setFilters={setFilters}
                filter={filter}
                showModal={showModal}
                setShowModal={setShowModal}
            />
            <Card>
                <Button disabled={!filter.active}>Usable</Button>
                <Grid>
                    <GridRow key={filter.key}>
                        <GridColumn>
                            <Checkbox checked={filter.active} onChange={changeActive} />
                        </GridColumn>

                        <GridColumn flex={5}>
                            {filter.operator ? (
                                <Select value={filterOperator} onChange={e => handleOperatorChange(e)}>
                                    {operatorOptions.map(operator => (
                                        <Select.Option key={operator.value} value={operator.value}>
                                            {operator.text}
                                        </Select.Option>
                                    ))}
                                </Select>
                            ) : (
                                t('filter-item.no-operator')
                            )}

                            <CurrentAttribute onClick={() => setShowModal(true)}>{filter.attributeId}</CurrentAttribute>

                            <Select value={filter.condition} onChange={(e: ConditionFilter) => changeCondition(e)}>
                                {conditionOptionsByType.map(condition => (
                                    <Select.Option key={condition.value} value={condition.value}>
                                        {condition.text}
                                    </Select.Option>
                                ))}
                            </Select>
                        </GridColumn>

                        <Button icon={<CloseOutlined />} size="small" onClick={deleteFilterItem} />
                    </GridRow>
                    <GridRow>
                        <SwitchFormFormat filter={filter} updateFilterValue={updateFilterValue} />
                    </GridRow>
                </Grid>
            </Card>
        </>
    );
}

interface ISwitchFormType {
    filter: IFilter;
    updateFilterValue: (newValue: any) => void;
}

const SwitchFormFormat = (props: ISwitchFormType) => {
    switch (props.filter.format) {
        case AttributeFormat.boolean:
            return <FormBoolean {...props} />;
        case AttributeFormat.text:
        default:
            return <FormText {...props} />;
    }
};

export default FilterItem;
