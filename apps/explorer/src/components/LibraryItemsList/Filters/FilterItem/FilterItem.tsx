// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {Button, Card, Checkbox, Divider, Select} from 'antd';
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
import {ILibraryItemListState} from '../../LibraryItemsListReducer';
import ChangeAttribute from './ChangeAttribute';
import BooleanFilter from './FilterInput/BooleanFilter';
import DateFilter from './FilterInput/DateFilter';
import NumericFilter from './FilterInput/NumericFilter';
import TextFilter from './FilterInput/TextFilter';

const CustomCard = styled(Card)`
    &:hover .handle {
        opacity: 1 !important;
    }
`;
const Handle = styled.div`
    margin: 0 5px;
    opacity: 0;

    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-content: center;

    & > div {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 1px;
        justify-items: center;
    }
`;

const HandlePoint = styled.div`
    background: hsla(0, 0%, 70%);
    border-radius: 100%;
    padding: 1px;
`;

const Grid = styled.div`
    display: flex;
    flex-flow: column;
    margin: 8px 16px 8px 0;
`;

const GridRow = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
`;

interface IGridColumnProps {
    flex?: number;
    style?: CSSObject;
}

const GridColumn = styled.div<IGridColumnProps>`
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

interface ICurrentAttributeProps {
    style?: CSSObject;
    disabled: boolean;
}

const CurrentAttribute = styled.span<ICurrentAttributeProps>`
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    background: ${props => (props.disabled ? 'hsla(0, 0%, 0%, 0.1)' : 'none')};
    padding: 0.5rem;
    border-radius: 0.25rem;

    &:hover {
        background: hsla(0, 0%, 0%, 0.1);
    }
`;

const CustomDivider = styled(Divider)`
    &&&&&&&& {
        margin: 0;

        & > * {
            height: 32px;
            display: flex;
            flex-flow: column;
            justify-content: center;
        }
    }
`;

const InputWrapper = styled.div`
    width: 100%;
`;

interface IFilterItemProps {
    stateItems: ILibraryItemListState;
    filter: IFilter;
    setFilters: React.Dispatch<React.SetStateAction<Array<Array<IFilter | IFilterSeparator>>>>;
    conditionOptions: Array<{
        text: string;
        value: ConditionFilter;
    }>;
    operatorOptions: Array<{
        text: string;
        value: OperatorFilter;
    }>;
    resetFilters: () => void;
    updateFilters: () => void;
    filterOperator: OperatorFilter;
    setFilterOperator: React.Dispatch<React.SetStateAction<OperatorFilter>>;
    handleProps: any;
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
    setFilterOperator,
    handleProps
}: IFilterItemProps): JSX.Element {
    const {t} = useTranslation();

    const [showModal, setShowModal] = useState(false);

    const isBooleanFilter = filter.format === AttributeFormat.boolean;

    const conditionOptionsByType = conditionOptions.filter(
        conditionOption => filter.format && allowedTypeOperator[filter.format]?.includes(conditionOption.value)
    );

    const changeActive = () => {
        setFilters(filters => {
            return filters.map(filterGroup => {
                const restFilters = filterGroup.filter(f => f.key !== filter.key);
                const currentFilter = filterGroup.find(f => f.key === filter.key);

                let newNewFilters: Array<IFilter | IFilterSeparator> = [];
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
        });

        updateFilters();
    };

    const deleteFilterItem = () => {
        setFilters(filters => {
            const newFilterGroup = filters.map(filterGroup => {
                let newFilters = filterGroup.filter(f => f.key !== filter.key);
                const activeFilters = (filterGroup as IFilter[]).filter(f => f.type === FilterTypes.filter && f.active);

                if (activeFilters.length && activeFilters[0].operator) {
                    const separators = filterGroup.filter(f => f.type === FilterTypes.separator);

                    newFilters = newFilters.map(f => {
                        const lastFilterIsSeparatorCondition = separators.some(
                            separator => separator.key === f.key - 1
                        );

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

            return newFilterGroup;
        });

        updateFilters();
    };

    const updateFilterValue = (newValue: any, valueSize?: number) => {
        setFilters(filters =>
            filters.map(filtersGroup => {
                const restFilters = filtersGroup.filter(f => f.key !== filter.key);
                const currentFilter = filtersGroup.find(f => f.key === filter.key);
                return currentFilter
                    ? [...restFilters, {...currentFilter, value: newValue, valueSize}].sort((f1, f2) => f1.key - f2.key)
                    : restFilters;
            })
        );
    };

    const changeCondition = (conditionFilter: ConditionFilter) => {
        const newCondition = conditionFilter;

        setFilters(filters =>
            filters.map(filtersGroup =>
                filtersGroup.reduce((acc, f) => {
                    if (f.key === filter.key) {
                        return [...acc, {...filter, condition: newCondition}];
                    }
                    return [...acc, f];
                }, [] as Array<IFilter | IFilterSeparator>)
            )
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
            <CustomDivider plain>
                {filter.operator ? (
                    <Select bordered={false} value={filterOperator} onChange={e => handleOperatorChange(e)}>
                        {operatorOptions.map(operator => (
                            <Select.Option key={operator.value} value={operator.value}>
                                {operator.text}
                            </Select.Option>
                        ))}
                    </Select>
                ) : (
                    <span style={{fontSize: '14px', padding: '0 20px'}}>{t('filter-item.no-operator')}</span>
                )}
            </CustomDivider>

            <CustomCard bodyStyle={{padding: 0}}>
                <div style={{display: 'grid', gridTemplateColumns: '1rem 1fr'}}>
                    <Handle className="handle" {...handleProps}>
                        <div>
                            {[...Array(8)].map((_, index) => (
                                <HandlePoint key={index} />
                            ))}
                        </div>
                    </Handle>
                    <Grid>
                        <GridRow key={filter.key}>
                            <GridColumn>
                                <Checkbox checked={filter.active} onChange={changeActive} />
                            </GridColumn>

                            <GridColumn flex={5}>
                                <CurrentAttribute onClick={() => setShowModal(true)} disabled={!filter.active}>
                                    {filter.attribute.id}
                                </CurrentAttribute>

                                {!isBooleanFilter && (
                                    <Select
                                        value={filter.condition}
                                        onChange={(e: ConditionFilter) => changeCondition(e)}
                                        disabled={!filter.active}
                                        bordered={false}
                                    >
                                        {conditionOptionsByType.map(condition => (
                                            <Select.Option key={condition.value} value={condition.value}>
                                                {condition.text}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                                {isBooleanFilter && (
                                    <BooleanFilter filter={filter} updateFilterValue={updateFilterValue} />
                                )}
                            </GridColumn>

                            <Button icon={<CloseOutlined />} size="small" onClick={deleteFilterItem} />
                        </GridRow>
                        {!isBooleanFilter && (
                            <GridRow>
                                <InputWrapper>
                                    <InputByFormat filter={filter} updateFilterValue={updateFilterValue} />
                                </InputWrapper>
                            </GridRow>
                        )}
                    </Grid>
                </div>
            </CustomCard>
        </>
    );
}

interface ISwitchFormType {
    filter: IFilter;
    updateFilterValue: (newValue: any) => void;
}

const InputByFormat = (props: ISwitchFormType) => {
    switch (props.filter.format) {
        case AttributeFormat.boolean:
            return <BooleanFilter {...props} />;
        case AttributeFormat.date:
            return <DateFilter {...props} />;
        case AttributeFormat.numeric:
            return <NumericFilter {...props} />;
        case AttributeFormat.text:
        default:
            return <TextFilter {...props} />;
    }
};

export default FilterItem;
