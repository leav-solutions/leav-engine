import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Divider, Dropdown, Menu, Modal, Sidebar, Transition} from 'semantic-ui-react';
import styled from 'styled-components';
import {FilterTypes, IFilter, IFilterSeparator, operatorFilter} from '../../../_types/types';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import SelectView from '../SelectView';
import AttributeList from './AttributeList';
import FilterItem from './FilterItem';
import FilterSeparator from './Filters/FilterSeparator';
import {getRequestFromFilter} from './Filters/FilterSeparator/getRequestFromFilter';
import {getConditionOptions, getOperatorOptions} from './FiltersOptions';

interface IFiltersProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    libId: string;
    libQueryName: string;
}

const Side = styled.div`
    border-right: 1px solid #ebebeb;
    padding: 1rem 1rem 0 1rem;
    height: 93%;
`;

const FilterActions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const FilterList = styled.div`
    height: 85%;
    overflow-y: scroll;
    padding: 0.3rem 0.3rem 0.3rem 0;
`;

function Filters({stateItems, dispatchItems, libId, libQueryName}: IFiltersProps): JSX.Element {
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
            type: LibraryItemListReducerActionTypes.SET_SHOW_FILTER,
            showFilter: false
        });
    };

    return (
        <Transition visible={stateItems.showFilters} onHide={handleHide} animation="slide right" duration={10}>
            <Sidebar.Pushable>
                <Modal open={showAttr} onClose={() => setShowAttr(false)}>
                    <Modal.Header>{t('filters.modal-header')}</Modal.Header>
                    <Modal.Content>
                        <AttributeList
                            libId={libId}
                            libQueryName={libQueryName}
                            setFilters={setFilters}
                            setShowAttr={setShowAttr}
                            filterOperator={filterOperator}
                            updateFilters={updateFilters}
                        />
                    </Modal.Content>
                </Modal>
                <Side>
                    <Menu style={{height: '5rem'}}>
                        <Menu.Menu>
                            <Menu.Item>
                                <Button icon="sidebar" onClick={handleHide} />
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

                        <Button positive compact onClick={applyFilters}>
                            {t('filters.apply')}
                        </Button>
                    </FilterActions>

                    <Divider />

                    <FilterList>
                        {filters.map(filter =>
                            filter.type === FilterTypes.filter ? (
                                <FilterItem
                                    key={filter.key}
                                    filter={filter}
                                    setFilters={setFilters}
                                    whereOptions={conditionOptions}
                                    operatorOptions={operatorOptions}
                                    resetFilters={resetFilters}
                                    updateFilters={updateFilters}
                                    filterOperator={filterOperator}
                                    setFilterOperator={setFilterOperator}
                                />
                            ) : (
                                <FilterSeparator
                                    key={filter.key}
                                    separator={filter}
                                    operatorOptions={operatorOptions}
                                    setFilters={setFilters}
                                    separatorOperator={separatorOperator}
                                    setSeparatorOperator={setSeparatorOperator}
                                    updateFilters={updateFilters}
                                />
                            )
                        )}
                    </FilterList>
                </Side>
            </Sidebar.Pushable>
        </Transition>
    );
}

export default Filters;
