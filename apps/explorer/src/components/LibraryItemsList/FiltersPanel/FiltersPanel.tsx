// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MoreOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import React, {useState} from 'react';
import {DragDropContext, Draggable, Droppable, DropResult, ResponderProvided} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {setFilters, setQueryFilters} from '../../../hooks/FiltersStateHook/FilterReducerAction';
import useStateFilters from '../../../hooks/FiltersStateHook/FiltersStateHook';
import themingVar from '../../../themingVar';
import SearchItems from '../SearchItems';
import AddFilter from './AddFilter';
import Filter from './Filter/Filter';
import './Filters.css';
import {getRequestFromFilters} from './getRequestFromFilter';

const Wrapper = styled.div`
    width: 100%;
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
            display: grid;
            align-items: center;
            justify-content: flex-end;
            column-gap: 8px;
            grid-template-columns: repeat(2, auto);
        }
    }
`;

const FiltersCounter = styled.div`
    background: ${themingVar['@default-bg']} 0% 0% no-repeat padding-box;
    box-shadow: ${themingVar['@leav-small-shadow']};
    border: ${themingVar['@leav-border']};
    border-radius: 3px;
    padding: 4px 8px;
`;

const SearchWrapper = styled.div`
    padding: 1rem;
`;

const FiltersWrapper = styled.div`
    padding: 1rem;
    height: calc(100% - 7rem);
    overflow: auto;
`;

const ListFilters = styled.div`
    display: grid;
`;

const CustomButton = styled(Button)`
    background: ${themingVar['@default-bg']};
`;

function FiltersPanel(): JSX.Element {
    const {t} = useTranslation();

    const [stateFilters, dispatchFilters] = useStateFilters();

    const [showAttr, setShowAttr] = useState(false);

    const applyFilters = () => {
        const request = getRequestFromFilters(stateFilters.filters);

        dispatchFilters(setQueryFilters(request));
    };

    const resetFilters = () => {
        dispatchFilters(setFilters([]));
        dispatchFilters(setQueryFilters([]));
    };

    const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        if (!result.destination) {
            return;
        }

        const newFilter = stateFilters.filters
            .map(filter => {
                if (result.source.index === filter.index) {
                    return {
                        ...filter,
                        index: result.destination.index
                    };
                } else if (result.destination.index === filter.index) {
                    return {
                        ...filter,
                        index: result.source.index
                    };
                }

                return filter;
            })
            .sort((a, b) => a.index - b.index);

        dispatchFilters(setFilters(newFilter));
    };

    const filtersSorted = stateFilters.filters.sort((a, b) => a.index - b.index);

    return (
        <>
            <AddFilter showAttr={showAttr} setShowAttr={setShowAttr} />
            <Wrapper>
                <Header>
                    <div>
                        <span>{t('filters.filters')}</span>
                        <FiltersCounter>{stateFilters.filters.length}</FiltersCounter>
                        <PrimaryBtn onClick={() => setShowAttr(true)} icon={<PlusOutlined />} shape="circle" />
                    </div>

                    <div>
                        <CustomButton onClick={applyFilters}>{t('global.apply')}</CustomButton>
                        <Dropdown
                            overlay={
                                <Menu>
                                    <Menu.Item onClick={resetFilters}>{t('filters.remove-filters')}</Menu.Item>
                                </Menu>
                            }
                        >
                            <CustomButton icon={<MoreOutlined />} />
                        </Dropdown>
                    </div>
                </Header>

                <SearchWrapper>
                    <SearchItems />
                </SearchWrapper>

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
        </>
    );
}

export default FiltersPanel;
