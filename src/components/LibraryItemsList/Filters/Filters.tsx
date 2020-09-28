import {FilterFilled} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import React, {useEffect, useState} from 'react';
import {DragDropContext, Draggable, Droppable, DropResult, ResponderProvided} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled, {CSSObject} from 'styled-components';
import {flatArray, reorder} from '../../../utils';
import {FilterTypes, IFilter, IFilterSeparator, OperatorFilter} from '../../../_types/types';
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
    position: relative;
    height: 100vh;
    margin-right: 16px;
`;

const Side = styled.div`
    border-right: 1px solid #ebebeb;
    padding-right: 1rem;
    height: 100%;
    width: 100%;
`;

const FilterActions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;
`;

const FilterList = styled.div`
    height: calc(100% - 10rem);
    overflow-y: scroll;
    padding: 0.3rem 0.3rem 0.3rem 0;
`;

const FilterGroup = styled.div`
    padding: 8px 8px;
    position: relative;
`;

interface IFiltersProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function Filters({stateItems, dispatchItems}: IFiltersProps): JSX.Element {
    const {t} = useTranslation();

    const [showAttr, setShowAttr] = useState(false);

    const [separatorOperator, setSeparatorOperator] = useState<OperatorFilter>(OperatorFilter.or);
    const [filterOperator, setFilterOperator] = useState<OperatorFilter>(OperatorFilter.and);

    const [filters, setFilters] = useState<(IFilter | IFilterSeparator)[][]>([[]]);

    const resetFilters = () =>
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_QUERY_FILTERS,
            queryFilters: []
        });

    const updateFilters = () => {
        setFilters(filtersGroup => {
            return filtersGroup.map(filters => {
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
        });
    };

    const removeAllFilter = () => {
        setFilters([]);
        resetFilters();
    };

    const addSeparator = () => {
        // use only 1 separator
        const filterSeparators = flatArray(filters).filter(filter => filter.type === FilterTypes.separator);

        if (filterSeparators.length === 0) {
            const newSeparator: IFilterSeparator = {
                type: FilterTypes.separator,
                key: filters.length,
                active: false
            };
            setFilters(fs => [...fs, [newSeparator]]);
        }
    };

    const applyFilters = () => {
        const request = getRequestFromFilter(flatArray(filters), filterOperator, separatorOperator);

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_QUERY_FILTERS,
            queryFilters: request
        });
    };

    useEffect(() => {
        setFilterOperator(fo => {
            if (fo === separatorOperator) {
                if (fo === OperatorFilter.and) {
                    return OperatorFilter.or;
                } else {
                    return OperatorFilter.and;
                }
            }
            return fo;
        });
    }, [separatorOperator]);

    useEffect(() => {
        setSeparatorOperator(so => {
            if (so === filterOperator) {
                if (so === OperatorFilter.and) {
                    return OperatorFilter.or;
                } else {
                    return OperatorFilter.and;
                }
            }
            return so;
        });
    }, [filterOperator]);

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
            <AddFilter
                stateItems={stateItems}
                dispatchItems={dispatchItems}
                setFilters={setFilters}
                showAttr={showAttr}
                setShowAttr={setShowAttr}
                updateFilters={updateFilters}
            />
            <Side>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingLeft: '1rem'
                    }}
                >
                    <div>
                        <Button icon={<FilterFilled />} onClick={handleHide} />
                    </div>
                    <div>
                        <SelectView />
                    </div>
                </div>

                <FilterActions>
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item onClick={() => setShowAttr(true)}>{t('filters.add-filters')}</Menu.Item>
                                <Menu.Item disabled={!filters.length} onClick={removeAllFilter}>
                                    {t('filters.remove-filters')}
                                </Menu.Item>
                                <Menu.Item disabled={!filters.length} onClick={addSeparator}>
                                    {t('filters.add-separator')}
                                </Menu.Item>
                            </Menu>
                        }
                    >
                        <span>{t('filters.filters-options')}</span>
                    </Dropdown>

                    <Button
                        disabled={!flatArray(filters).filter(f => f.type === FilterTypes.filter).length}
                        onClick={applyFilters}
                        type="primary"
                    >
                        {t('filters.apply')}
                    </Button>
                </FilterActions>

                <FilterList>
                    <FilterElements
                        filters={filters}
                        setFilters={setFilters}
                        stateItems={stateItems}
                        dispatchItems={dispatchItems}
                        resetFilters={resetFilters}
                        updateFilters={updateFilters}
                        filterOperator={filterOperator}
                        setFilterOperator={setFilterOperator}
                        separatorOperator={separatorOperator}
                        setSeparatorOperator={setSeparatorOperator}
                    />
                </FilterList>
            </Side>
        </WrapperFilter>
    );
}

interface IFilterElements {
    filters: (IFilter | IFilterSeparator)[][];
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[][]>>;
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    resetFilters: () => void;
    updateFilters: () => void;
    filterOperator: OperatorFilter;
    setFilterOperator: React.Dispatch<React.SetStateAction<OperatorFilter>>;
    separatorOperator: OperatorFilter;
    setSeparatorOperator: React.Dispatch<React.SetStateAction<OperatorFilter>>;
}

const FilterElements = ({
    filters,
    setFilters,
    stateItems,
    resetFilters,
    updateFilters,
    filterOperator,
    setFilterOperator,
    separatorOperator,
    setSeparatorOperator
}: IFilterElements) => {
    const {t} = useTranslation();

    const conditionOptions = getConditionOptions(t);
    const operatorOptions = getOperatorOptions(t);

    let lastType: string;
    // Create group of filters in function of separators
    const result = flatArray(filters)
        .reduce((acc, filter) => {
            // Group filters by type
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
        .map((arrayFilters, index) => {
            if (arrayFilters[0].type === FilterTypes.filter) {
                return (
                    <Droppable key={index} droppableId={`filter-group-${index}`} type={`droppableSubItem`}>
                        {provided => (
                            <FilterGroup key={index} ref={provided.innerRef} {...provided.droppableProps}>
                                {arrayFilters.map((filter, filterIndex) =>
                                    filter.type === FilterTypes.filter ? (
                                        <Draggable
                                            key={filter.key}
                                            index={filterIndex}
                                            draggableId={filter.key.toString()}
                                        >
                                            {provided => (
                                                <div ref={provided.innerRef} {...provided.draggableProps}>
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
                                                        handleProps={provided.dragHandleProps}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ) : (
                                        <></>
                                    )
                                )}
                                {provided.placeholder}
                            </FilterGroup>
                        )}
                    </Droppable>
                );
            }
            return arrayFilters.map(filter =>
                filter.type === FilterTypes.separator ? (
                    <Draggable key={filter.key} index={index} draggableId={filter.key.toString()}>
                        {provided => (
                            <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                <FilterSeparator
                                    key={filter.key}
                                    separator={filter}
                                    operatorOptions={operatorOptions}
                                    setFilters={setFilters}
                                    separatorOperator={separatorOperator}
                                    setSeparatorOperator={setSeparatorOperator}
                                    updateFilters={updateFilters}
                                />
                            </div>
                        )}
                    </Draggable>
                ) : (
                    <></>
                )
            );
        })
        .map(filters => (Array.isArray(filters) ? filters : [filters]));

    const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index) {
            return;
        }

        const indexFilterGroup = parseInt(result.destination.droppableId.split('-').pop() ?? '0');

        let indexDestination = result.destination?.index ?? 0;
        indexDestination = indexFilterGroup > 0 ? indexDestination + 1 : indexDestination;

        setFilters(f => {
            const lastFilterGroup = f.pop();
            if (lastFilterGroup) {
                const newLastFilterGroup = reorder(lastFilterGroup, result.source.index, indexDestination).map(
                    (filter, index) => ({
                        ...filter,
                        key: index
                    })
                );

                return [...f, newLastFilterGroup as IFilter[]];
            }
            return [...f];
        });

        updateFilters();
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="filter">
                {provided => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {result.reduce((acc, val, index) => acc.concat(<div key={index}>{val}</div>), [])}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default Filters;
