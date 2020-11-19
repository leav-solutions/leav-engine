import {LeftOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu, Tooltip} from 'antd';
import React, {useEffect, useState} from 'react';
import {DragDropContext, Draggable, Droppable, DropResult, ResponderProvided} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled, {CSSObject} from 'styled-components';
import {useActiveLibrary} from '../../../hook/ActiveLibHook';
import {flatArray, getUniqueId, reorder} from '../../../utils';
import {FilterTypes, IFilter, IFilterSeparator, OperatorFilter} from '../../../_types/types';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import SearchItems from '../SearchItems';
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

const move = (
    list: any[][],
    droppableSource: any,
    droppableDestination: any,
    sourceIndex: number,
    destIndex: number
) => {
    const sourceClone = Array.from(list[sourceIndex]);
    const destClone = Array.from(list[destIndex]);

    const [removed] = sourceClone.splice(droppableSource.index, 1);
    destClone.splice(droppableDestination.index, 0, removed);

    // change key value
    const sourceCloneOrdered = sourceClone.reduce((acc, filter, index) => {
        return [...acc, {...filter, key: index}];
    }, [] as (IFilterElements | IFilterSeparator)[]);

    const destCloneOrdered = destClone.reduce((acc, filter, index) => {
        return [...acc, {...filter, key: index}];
    }, [] as (IFilterElements | IFilterSeparator)[]);

    const result = list;
    result[sourceIndex] = sourceCloneOrdered;
    result[destIndex] = destCloneOrdered;

    // Remove empty array
    const filterResult = result.filter(arr => arr.length);

    return filterResult;
};

interface IFiltersProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function Filters({stateItems, dispatchItems}: IFiltersProps): JSX.Element {
    const {t} = useTranslation();

    const [activeLibrary] = useActiveLibrary();

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
        setFilters(filtersGroups => {
            return filtersGroups.map((filters, indexOne) => {
                let newFilters = filters.sort((a, b) => a.key - b.key);

                let noOperator = true;

                newFilters = newFilters.map((filter, indexTwo) => {
                    if (filter.key !== indexTwo) {
                        filter.key = indexTwo;
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

                        let conditionBefore = (filters.filter(
                            f => f.type === FilterTypes.filter && f.key < filter.key
                        ) as IFilter[]).some(f => f.active);

                        let conditionAfter = (filters.filter(
                            f => f.type === FilterTypes.filter && f.key > filter.key
                        ) as IFilter[]).some(f => f.active);

                        if (!conditionBefore) {
                            conditionBefore =
                                filtersGroups[indexOne - 1] &&
                                filtersGroups[indexOne - 1][0] &&
                                filtersGroups[indexOne - 1][0].type === FilterTypes.filter;
                        }

                        if (!conditionAfter) {
                            conditionAfter =
                                filtersGroups[indexOne + 1] &&
                                filtersGroups[indexOne + 1][0] &&
                                filtersGroups[indexOne + 1][0].type === FilterTypes.filter;
                        }

                        if (conditionBefore && conditionAfter) {
                            filter.active = true;
                        } else {
                            filter.active = false;
                        }
                    }

                    return filter;
                });

                // if last element of the group was a filter, set operator true
                if (newFilters && filtersGroups[indexOne - 1] && filtersGroups[indexOne - 1].length) {
                    const previousIsFilter = filtersGroups[indexOne - 1][0].type === FilterTypes.filter;
                    const currentIsFilter = filtersGroups[indexOne][0].type === FilterTypes.filter;
                    const lastElement = newFilters[0];

                    if (previousIsFilter && currentIsFilter && lastElement.type === FilterTypes.filter) {
                        lastElement.operator = true;
                    }
                }

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
                id: getUniqueId(),
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

    // reset filter when change library
    const activeLibraryId = activeLibrary?.id;
    useEffect(() => {
        setFilters([]);
    }, [activeLibraryId, setFilters]);

    const handleHide = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SHOW_FILTERS,
            showFilters: false
        });
    };

    const canApplyFilter =
        stateItems.searchFullTextActive || !flatArray(filters).filter(f => f.type === FilterTypes.filter).length;

    const submitMessage = stateItems.searchFullTextActive
        ? t('filters.search-active')
        : !flatArray(filters).filter(f => f.type === FilterTypes.filter).length
        ? t('filters.no-filters')
        : t('filters.submit');

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
                        justifyContent: 'space-between'
                    }}
                >
                    <Button icon={<LeftOutlined />} onClick={handleHide} />
                    <SearchItems />
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

                    <Tooltip title={submitMessage} placement="right">
                        <Button disabled={canApplyFilter} onClick={applyFilters} type="primary">
                            {t('filters.apply')}
                        </Button>
                    </Tooltip>
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

    const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        const {source, destination} = result;

        // dropped outside the list
        if (!destination) {
            return;
        }

        const sourceGroupIndex = parseInt(source.droppableId.split('-').pop() ?? '0');
        const destinationGroupIndex = parseInt(destination.droppableId.split('-').pop() ?? '0');

        if (source.droppableId === destination.droppableId) {
            const newFiltersGroup = reorder(filters[destinationGroupIndex], source.index, destination.index);

            // switch key
            const newFiltersGroupOrdered = newFiltersGroup.reduce((acc, filter, index) => {
                return [...acc, {...filter, key: index}];
            }, [] as (IFilterElements | IFilterSeparator)[]);

            const newFilters = filters.reduce((acc, filtersGroup, index) => {
                if (index === destinationGroupIndex) {
                    return [...acc, newFiltersGroupOrdered];
                }

                return [...acc, filtersGroup];
            }, [] as (IFilter | IFilterSeparator)[][]);

            setFilters(newFilters);
        } else {
            const newFilters = move(filters, source, destination, sourceGroupIndex, destinationGroupIndex);

            setFilters(newFilters);
        }

        updateFilters();
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {filters.map((filtersGroup, index) => (
                <Droppable key={index} droppableId={`droppableId-${index}`}>
                    {providedDroppable => (
                        <div ref={providedDroppable.innerRef}>
                            {filtersGroup.map((filter, index) => (
                                <Draggable key={filter.id} draggableId={filter.id} index={index}>
                                    {provided =>
                                        filter.type === FilterTypes.filter ? (
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
                                        ) : (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.dragHandleProps}
                                                {...provided.draggableProps}
                                            >
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
                                        )
                                    }
                                </Draggable>
                            ))}
                            {providedDroppable.placeholder}
                        </div>
                    )}
                </Droppable>
            ))}
        </DragDropContext>
    );
};

export default Filters;
