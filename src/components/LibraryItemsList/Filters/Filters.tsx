import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Divider, Dropdown, Menu, Modal, Sidebar, Transition} from 'semantic-ui-react';
import styled from 'styled-components';
import {
    conditionFilter,
    FilterTypes,
    IFilter,
    IFilterSeparator,
    IQueryFilter,
    operatorFilter
} from '../../../_types/types';
import SelectView from '../SelectView';
import AttributeList from './AttributeList';
import FilterItem from './FilterItem';
import FilterSeparator from './Filters/FilterSeparator';
import {getRequestFromFilter} from './Filters/FilterSeparator/getRequestFromFilter';

interface IFiltersProps {
    showFilters: boolean;
    setShowFilters: (showFilters: (x: boolean) => boolean) => void;
    libId: string;
    libQueryName: string;
    setQueryFilters: React.Dispatch<React.SetStateAction<IQueryFilter[]>>;
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

function Filters({showFilters, setShowFilters, libId, libQueryName, setQueryFilters}: IFiltersProps): JSX.Element {
    const {t} = useTranslation();

    const [showAttr, setShowAttr] = useState(false);
    const [show, setShow] = useState(showFilters);

    const [separatorOperator, setSeparatorOperator] = useState<operatorFilter>(operatorFilter.or);
    const [filterOperator, setFilterOperator] = useState<operatorFilter>(operatorFilter.and);

    const [filters, setFilters] = useState<(IFilter | IFilterSeparator)[]>([]);

    useEffect(() => {
        setShow(showFilters);
    }, [showFilters]);

    const whereOptions = [
        {text: t('filters.contains'), value: conditionFilter.contains},
        {text: t('filters.not-contains'), value: conditionFilter.notContains},
        {text: t('filters.equal'), value: conditionFilter.equal},
        {text: t('filters.not-equal'), value: conditionFilter.notEqual},
        {text: t('filters.begin-with'), value: conditionFilter.beginWith},
        {text: t('filters.end-with'), value: conditionFilter.endWith},
        {text: t('filters.is-empty'), value: conditionFilter.empty},
        {text: t('filters.is-not-empty'), value: conditionFilter.notEmpty},
        {text: t('filters.greater-than'), value: conditionFilter.greaterThan},
        {text: t('filters.less-than'), value: conditionFilter.lessThan},
        {text: t('filters.exist'), value: conditionFilter.exist},
        {text: t('filters.search-in'), value: conditionFilter.searchIn}
    ];

    const operatorOptions = [
        {text: t('filters.and'), value: operatorFilter.and},
        {text: t('filters.or'), value: operatorFilter.or}
    ];

    const resetFilters = () => setQueryFilters([]);

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
        setQueryFilters(request);
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

    return (
        <Transition visible={show} onHide={() => setShowFilters(show => false)} animation="slide right" duration={10}>
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
                                <Button icon="sidebar" onClick={() => setShow(false)} />
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
                                    whereOptions={whereOptions}
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
