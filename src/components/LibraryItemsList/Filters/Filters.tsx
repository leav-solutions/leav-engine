import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Divider, Dropdown, Menu, Modal, Sidebar, Transition} from 'semantic-ui-react';
import styled from 'styled-components';
import {IFilters, IQueryFilter, operatorFilter, whereFilter} from '../../../_types/types';
import SelectVue from '../SelectVue';
import AttributeList from './AttributeList';
import FilterItem from './FilterItem';

interface IFiltersProps {
    showFilters: boolean;
    setShowFilters: (showFilters: (x: boolean) => boolean) => void;
    libId: string;
    libQueryName: string;
    setQueryFilters: React.Dispatch<React.SetStateAction<IQueryFilter[] | null>>;
}

const Side = styled.div`
    border-right: 1px solid #ebebeb;
    padding: 1rem 1rem 0 1rem;
    height: 100%;
`;

const FilterActions = styled.div`
    display: flex;
    justify-content: space-between;
`;

const FilterList = styled.div`
    overflow: scroll;
    height: 100%;
`;

function Filters({showFilters, setShowFilters, libId, libQueryName, setQueryFilters}: IFiltersProps): JSX.Element {
    const {t} = useTranslation();
    const [showAttr, setShowAttr] = useState(false);
    const [show, setShow] = useState(showFilters);
    const [filters, setFilters] = useState<IFilters[]>([
        {
            key: 0,
            where: whereFilter.contains,
            value: '',
            attribute: 'id',
            active: true
        }
    ]);

    useEffect(() => {
        setShow(showFilters);
    }, [showFilters]);

    const whereOptions = [
        {text: t('filters.contains'), value: whereFilter.contains},
        {text: t('filters.not-contains'), value: whereFilter.notContains},
        {text: t('filters.equal'), value: whereFilter.equal},
        {text: t('filters.not-equal'), value: whereFilter.notEqual},
        {text: t('filters.begin-with'), value: whereFilter.beginWith},
        {text: t('filters.end-with'), value: whereFilter.endWith},
        {text: t('filters.is-empty'), value: whereFilter.empty},
        {text: t('filters.is-not-empty'), value: whereFilter.notEmpty},
        {text: t('filters.greater-than'), value: whereFilter.greaterThan},
        {text: t('filters.less-than'), value: whereFilter.lessThan},
        {text: t('filters.exist'), value: whereFilter.exist},
        {text: t('filters.search-in'), value: whereFilter.searchIn}
    ];

    const operatorOptions = [
        {text: t('filters.and'), value: operatorFilter.and},
        {text: t('filters.or'), value: operatorFilter.or}
    ];

    const resetFilters = () => setQueryFilters(null);

    const removeAllFilter = () => {
        setFilters([]);
        resetFilters();
    };

    const applyFiler = () => {
        let request: IQueryFilter[] = [];

        for (let filter of filters) {
            if (filter.operator) {
                request.push({operator: filter.operator});
            }
            request.push({operator: '('});

            filter.value.split('\n').forEach((filterValue, index) => {
                if (index > 0) {
                    request.push({operator: operatorFilter.or});
                }
                request.push({field: filter.attribute, value: filterValue, operator: filter.where});
            });
            request.push({operator: ')'});
        }

        setQueryFilters(request);
    };

    return (
        <Transition visible={show} onHide={() => setShowFilters(show => false)} animation="slide right" duration={100}>
            <Sidebar.Pushable>
                <Modal open={showAttr} onClose={() => setShowAttr(false)}>
                    <Modal.Header>{t('filters.modal-header')}</Modal.Header>
                    <Modal.Content>
                        <AttributeList
                            libId={libId}
                            libQueryName={libQueryName}
                            setFilters={setFilters}
                            setShowAttr={setShowAttr}
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
                                <SelectVue />
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>

                    <Divider />

                    <FilterList>
                        <FilterActions>
                            <Dropdown text={t('filters.filters-options')}>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => setShowAttr(true)}>
                                        {t('filters.add-filters')}
                                    </Dropdown.Item>
                                    <Dropdown.Item disabled={!filters.length} onClick={removeAllFilter}>
                                        {t('filters.remove-filters')}
                                    </Dropdown.Item>
                                    <Dropdown.Item disabled={!filters.length}>
                                        {t('filters.add-separator')}
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                            <Button positive compact disabled={!filters.length} onClick={applyFiler}>
                                {t('filters.apply')}
                            </Button>
                        </FilterActions>

                        {filters.map(filter => (
                            <FilterItem
                                key={filter.key}
                                filter={filter}
                                setFilters={setFilters}
                                whereOptions={whereOptions}
                                operatorOptions={operatorOptions}
                                resetFilters={resetFilters}
                            />
                        ))}
                    </FilterList>
                </Side>
            </Sidebar.Pushable>
        </Transition>
    );
}

export default Filters;
