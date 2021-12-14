// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React from 'react';
import {useAppDispatch} from 'redux/store';
import {DragDropContext, Draggable, Droppable, DropResult, ResponderProvided} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from '../../../themingVar';
import Filter from './Filter/Filter';
import {setDisplaySide} from 'redux/display';
import {TypeSideItem} from '_types/types';
import {IconClosePanel} from '../../../assets/icons/IconClosePanel';
import {getRequestFromFilters} from './getRequestFromFilter';
import AvailableSoon from 'components/shared/AvailableSoon';

import './Filters.css';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    border-right: ${themingVar['@divider-color']} 1px solid;
    overflow-y: auto;
    width: 1000px;
`;

const Header = styled.div`
    width: 100%;
    background-color: ${themingVar['@leav-view-panel-background-title']};
    display: grid;
    grid-template-columns: repeat(2, auto);
    justify-content: space-between;
    padding: 0.3rem 0.3rem 0.3rem 1rem;
    font-weight: 700;
    border-bottom: 1px solid ${themingVar['@divider-color']};

    & > * {
        :first-of-type {
            display: grid;
            column-gap: 8px;
            grid-template-columns: repeat(3, auto);
            align-items: center;
            justify-items: center;
        }

        :last-of-type {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            column-gap: 8px;
            grid-template-columns: repeat(2, auto);
        }
    }
`;

const FiltersWrapper = styled.div`
    height: calc(100% - 7rem);
    overflow: auto;
`;

const ListFilters = styled.div`
    display: grid;
`;

function FiltersPanel(): JSX.Element {
    const {t} = useTranslation();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const dispatch = useAppDispatch();

    const resetFilters = () => {
        searchDispatch({
            type: SearchActionTypes.SET_FILTERS,
            filters: []
        });

        searchDispatch({
            type: SearchActionTypes.SET_QUERY_FILTERS,
            queryFilters: []
        });
    };

    const disableFilters = () => {
        searchDispatch({
            type: SearchActionTypes.SET_FILTERS,
            filters: searchState.filters.map(f => ({...f, active: false}))
        });
    };

    const handleHide = () => {
        dispatch(
            setDisplaySide({
                visible: false,
                type: TypeSideItem.filters
            })
        );
    };

    const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        if (!result.destination) {
            return;
        }

        const newFilter = searchState.filters
            .map(filter => {
                return {
                    ...filter,
                    index:
                        result.source.index === filter.index
                            ? result.destination.index
                            : result.destination.index === filter.index
                            ? result.source.index
                            : filter.index
                };
            })
            .sort((a, b) => a.index - b.index);

        searchDispatch({
            type: SearchActionTypes.SET_FILTERS,
            filters: newFilter
        });
    };

    const filtersSorted = searchState.filters.sort((a, b) => a.index - b.index);

    const _handleApplyFilters = () => {
        searchDispatch({
            type: SearchActionTypes.SET_QUERY_FILTERS,
            queryFilters: getRequestFromFilters(searchState.filters)
        });

        searchDispatch({type: SearchActionTypes.SET_LOADING, loading: true});
    };

    const allFiltersDisabled = searchState.filters.every(f => f.active === false);

    return (
        <Wrapper>
            <Header>
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item disabled={allFiltersDisabled} onClick={disableFilters}>
                                {t('filters.disable-filters')}
                            </Menu.Item>
                            <Menu.Item disabled={!searchState.filters.length} onClick={resetFilters}>
                                {t('filters.remove-filters')}
                            </Menu.Item>
                            <Menu.Item disabled={true}>
                                {t('filters.add-condition')} <AvailableSoon />
                            </Menu.Item>
                        </Menu>
                    }
                >
                    <Button type={'text'}>
                        {t('filters.filters')}
                        <DownOutlined style={{marginTop: '5px', marginLeft: '-3px'}} />
                    </Button>
                </Dropdown>
                <div>
                    <Button disabled={!searchState.filters.length} onClick={_handleApplyFilters}>
                        {t('filters.apply')}
                    </Button>

                    <Button onClick={handleHide} icon={<IconClosePanel />}></Button>
                </div>
            </Header>

            <FiltersWrapper>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={'droppable'}>
                        {providedDroppable => (
                            <ListFilters {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                                {filtersSorted.map(filter => (
                                    <Draggable
                                        key={filter.index}
                                        draggableId={filter.index.toString()}
                                        index={filter.index}
                                    >
                                        {provided => (
                                            <div ref={provided.innerRef} {...provided.draggableProps}>
                                                <Filter
                                                    key={filter.index}
                                                    filter={filter}
                                                    handleProps={provided.dragHandleProps}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {providedDroppable.placeholder}
                            </ListFilters>
                        )}
                    </Droppable>
                </DragDropContext>
            </FiltersWrapper>
        </Wrapper>
    );
}

export default FiltersPanel;
