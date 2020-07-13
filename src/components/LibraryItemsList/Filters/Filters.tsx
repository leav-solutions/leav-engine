import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Divider, Dropdown, Menu, Sidebar, Segment} from 'semantic-ui-react';
import styled, {CSSObject} from 'styled-components';
import {FilterTypes, IFilter, IFilterSeparator, operatorFilter} from '../../../_types/types';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import SelectView from '../SelectView';
import AddFilter from './AddFilter';
import FilterItem from './FilterItem';
import './Filters.css';
import FilterSeparator from './FilterSeparator';
import {getConditionOptions, getOperatorOptions} from './FiltersOptions';
import {getRequestFromFilter} from './getRequestFromFilter';

interface WrapperFilterProps {
    visible: 1 | 0;
    style?: CSSObject;
}

const WrapperFilter = styled.div<WrapperFilterProps>`
    display: ${({visible}) => (visible ? 'flex' : 'none')};
`;

const CustomSidebarPushable = styled(Sidebar.Pushable)`
    width: 100%;
`;

const Side = styled.div`
    border-right: 1px solid #ebebeb;
    padding: 1rem 1rem 0 1rem;
    height: 100%;
`;

const FilterActions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const FilterList = styled.div`
    height: calc(100% - 11rem);
    overflow-y: scroll;
    padding: 0.3rem 0.3rem 0.3rem 0;
`;

interface IFiltersProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function Filters({stateItems, dispatchItems}: IFiltersProps): JSX.Element {
    const {t} = useTranslation();

    const [showAttr, setShowAttr] = useState(false);

    const [separatorOperator, setSeparatorOperator] = useState<operatorFilter>(operatorFilter.or);
    const [filterOperator, setFilterOperator] = useState<operatorFilter>(operatorFilter.and);

    const [filters, setFilters] = useState<(IFilter | IFilterSeparator)[]>([]);

    const conditionOptions = getConditionOptions(t);
    const operatorOptions = getOperatorOptions(t);

    const resetFilters = () =>
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_QUERY_FILTERS,
            queryFilters: []
        });

    const removeAllFilter = () => {
        setFilters([]);
        resetFilters();
    };

    const addSeparator = () => {
        // use only 1 separator
        const filterSeparators = filters.filter(filter => filter.type === FilterTypes.separator);

        if (filterSeparators.length === 0) {
            const newSeparator: IFilterSeparator = {
                type: FilterTypes.separator,
                key: filters.length,
                active: false
            };
            setFilters(fs => [...fs, newSeparator]);
        }
    };

    const applyFilters = () => {
        const request = getRequestFromFilter(filters, filterOperator, separatorOperator);
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_QUERY_FILTERS,
            queryFilters: request
        });
    };

    useEffect(() => {
        setFilterOperator(fo => {
            if (fo === separatorOperator) {
                if (fo === operatorFilter.and) {
                    return operatorFilter.or;
                } else {
                    return operatorFilter.and;
                }
            }
            return fo;
        });
    }, [separatorOperator]);

    useEffect(() => {
        setSeparatorOperator(so => {
            if (so === filterOperator) {
                if (so === operatorFilter.and) {
                    return operatorFilter.or;
                } else {
                    return operatorFilter.and;
                }
            }
            return so;
        });
    }, [filterOperator]);

    const updateFilters = () => {
        setFilters(filters => {
            let newFilters = filters.sort((a, b) => a.key - b.key);

            let noOperator = true;
            newFilters = newFilters.map((filter, index) => {
                if (filter.key !== index) {
                    filter.key = index;
                }

                if (filter.type === FilterTypes.filter) {
                    if (noOperator && filter.active) {
                        filter.operator = false;
                        noOperator = false;
                    } else if (!filter.operator) {
                        filter.operator = true;
                    }
                } else if (filter.type === FilterTypes.separator) {
                    noOperator = true;

                    const conditionBefore = (filters.filter(
                        f => f.type === FilterTypes.filter && f.key < filter.key
                    ) as IFilter[]).some(f => f.active);

                    const conditionAfter = (filters.filter(
                        f => f.type === FilterTypes.filter && f.key > filter.key
                    ) as IFilter[]).some(f => f.active);

                    if (conditionBefore && conditionAfter) {
                        filter.active = true;
                    } else {
                        filter.active = false;
                    }
                }

                return filter;
            });

            return newFilters;
        });
    };

    const handleHide = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SHOW_FILTERS,
            showFilters: false
        });
    };

    return (
        <WrapperFilter
            visible={stateItems.showFilters ? 1 : 0}
            className={stateItems.showFilters ? 'wrapped-filter-open' : 'wrapped-filter-close'}
        >
            <CustomSidebarPushable>
                <AddFilter
                    stateItems={stateItems}
                    setFilters={setFilters}
                    showAttr={showAttr}
                    setShowAttr={setShowAttr}
                    updateFilters={updateFilters}
                />

                <Side>
                    <Menu style={{height: '5rem'}}>
                        <Menu.Menu>
                            <Menu.Item>
                                <Button icon="filter" active onClick={handleHide} />
                            </Menu.Item>
                        </Menu.Menu>
                        <Menu.Menu position="right">
                            <Menu.Item>
                                <SelectView />
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>

                    <FilterActions>
                        <Dropdown text={t('filters.filters-options')}>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setShowAttr(true)}>
                                    {t('filters.add-filters')}
                                </Dropdown.Item>
                                <Dropdown.Item disabled={!filters.length} onClick={removeAllFilter}>
                                    {t('filters.remove-filters')}
                                </Dropdown.Item>
                                <Dropdown.Item disabled={!filters.length} onClick={addSeparator}>
                                    {t('filters.add-separator')}
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Button
                            positive
                            disabled={!filters.filter(f => f.type === FilterTypes.filter).length}
                            compact
                            onClick={applyFilters}
                        >
                            {t('filters.apply')}
                        </Button>
                    </FilterActions>

                    <Divider />

                    <FilterList>
                        {
                            <FilterElements
                                filters={filters}
                                setFilters={setFilters}
                                stateItems={stateItems}
                                conditionOptions={conditionOptions}
                                operatorOptions={operatorOptions}
                                resetFilters={resetFilters}
                                updateFilters={updateFilters}
                                filterOperator={filterOperator}
                                setFilterOperator={setFilterOperator}
                                separatorOperator={separatorOperator}
                                setSeparatorOperator={setSeparatorOperator}
                            />
                        }
                    </FilterList>
                </Side>
            </CustomSidebarPushable>
        </WrapperFilter>
    );
}

const FilterGroup = styled.div`
    padding: 0.3rem;
    border: 1px solid hsla(0, 0%, 90%);
    border-radius: 0.25rem;
`;

interface IFilterElements {
    filters: (IFilter | IFilterSeparator)[];
    setFilters: any;
    stateItems: any;
    conditionOptions: any;
    operatorOptions: any;
    resetFilters: any;
    updateFilters: any;
    filterOperator: any;
    setFilterOperator: any;
    separatorOperator: any;
    setSeparatorOperator: any;
}

const FilterElements = ({
    filters,
    setFilters,
    stateItems,
    conditionOptions,
    operatorOptions,
    resetFilters,
    updateFilters,
    filterOperator,
    setFilterOperator,
    separatorOperator,
    setSeparatorOperator
}: IFilterElements) => {
    let lastType: string;

    const result = filters
        .reduce((acc, filter) => {
            if (lastType !== filter.type) {
                lastType = filter.type;
                return [...acc, [filter]];
            }
            const lastArray = acc.pop();
            if (lastArray) {
                return [...acc, [...lastArray, filter]];
            }
            return [...acc, [filter]];
        }, [] as (IFilter | IFilterSeparator)[][])
        .map(arrayFilters => {
            if (Array.isArray(arrayFilters)) {
                if (arrayFilters[0].type === FilterTypes.filter) {
                    return (
                        <FilterGroup>
                            {arrayFilters.map(filter =>
                                filter.type === FilterTypes.filter ? (
                                    <FilterItem
                                        key={filter.key}
                                        stateItems={stateItems}
                                        filter={filter}
                                        setFilters={setFilters}
                                        conditionOptions={conditionOptions}
                                        operatorOptions={operatorOptions}
                                        resetFilters={resetFilters}
                                        updateFilters={updateFilters}
                                        filterOperator={filterOperator}
                                        setFilterOperator={setFilterOperator}
                                    />
                                ) : (
                                    <></>
                                )
                            )}
                        </FilterGroup>
                    );
                }
                return arrayFilters.map(filter =>
                    filter.type === FilterTypes.separator ? (
                        <>
                            <FilterSeparator
                                key={filter.key}
                                separator={filter}
                                operatorOptions={operatorOptions}
                                setFilters={setFilters}
                                separatorOperator={separatorOperator}
                                setSeparatorOperator={setSeparatorOperator}
                                updateFilters={updateFilters}
                            />
                        </>
                    ) : (
                        <></>
                    )
                );
            }
            return [];
        })
        .map(filters => (Array.isArray(filters) ? filters : [filters]));
    return <>{result.reduce((acc, val) => acc.concat(<>{val}</>), [])}</>;
};

export default Filters;
