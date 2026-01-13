// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined} from '@ant-design/icons';
import {faAngleLeft} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Button, Dropdown, Space} from 'antd';
import {DndContext, closestCenter} from '@dnd-kit/core';
import {SortableContext, verticalListSortingStrategy, arrayMove} from '@dnd-kit/sortable';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {SearchActionTypes} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import Filter from './Filter/Filter';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    border-right: ${themeVars.borderLightColor} 1px solid;
    overflow-y: auto;
    width: 1000px;
`;

const Header = styled.div`
    width: 100%;
    background-color: ${themeVars.headerBg};
    display: grid;
    grid-template-columns: repeat(2, auto);
    justify-content: space-between;
    padding: 0.3rem 0.3rem 0.3rem 1rem;
    font-weight: 700;
    border-bottom: 1px solid ${themeVars.borderLightColor};

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
            justify-content: center;
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
    const {t} = useSharedTranslation();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const _resetFilters = () => {
        searchDispatch({type: SearchActionTypes.RESET_FILTERS});
    };

    const _disableFilters = () => {
        searchDispatch({type: SearchActionTypes.DISABLE_FILTERS});
    };

    const _enableFilters = () => {
        searchDispatch({type: SearchActionTypes.ENABLE_FILTERS});
    };

    const _handleHide = () => {
        searchDispatch({type: SearchActionTypes.SET_SIDEBAR, visible: false, sidebarType: searchState.sideBar.type});
    };

    const handleDragEnd = event => {
        const {active, over} = event;
        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = searchState.filters.findIndex(f => f.key === active.id);
        const newIndex = searchState.filters.findIndex(f => f.key === over.id);
        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const filters = arrayMove(searchState.filters, oldIndex, newIndex).map((filter, idx) => ({
            ...filter,
            index: idx,
        }));

        searchDispatch({type: SearchActionTypes.SET_FILTERS, filters});
    };

    const filtersSorted = searchState.filters.sort((a, b) => a.index - b.index);

    const _handleApplyFilters = () => {
        searchDispatch({type: SearchActionTypes.APPLY_FILTERS});
    };

    const allFiltersDisabled = searchState.filters.every(f => f.active === false);
    const allFiltersEnabled = searchState.filters.every(f => f.active === true);

    return (
        <Wrapper>
            <Header>
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'disable',
                                disabled: allFiltersDisabled,
                                onClick: _disableFilters,
                                label: t('filters.disable-filters'),
                            },
                            {
                                key: 'enable',
                                disabled: allFiltersEnabled,
                                onClick: _enableFilters,
                                label: t('filters.enable-filters'),
                            },
                            {
                                key: 'remove',
                                disabled: !searchState.filters.length,
                                onClick: _resetFilters,
                                label: t('filters.remove-filters'),
                            },
                        ],
                    }}
                >
                    <Button type="text" style={{display: 'inline-flex'}}>
                        {t('filters.filters')}
                        <DownOutlined style={{marginTop: '5px', marginLeft: '-3px'}} />
                    </Button>
                </Dropdown>
                <Space size="small">
                    <Button disabled={!searchState.filters.length} onClick={_handleApplyFilters}>
                        {t('filters.apply')}
                    </Button>
                    <Button onClick={_handleHide} icon={<FontAwesomeIcon icon={faAngleLeft} />} />
                </Space>
            </Header>

            <FiltersWrapper>
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filtersSorted.map(v => v.key)} strategy={verticalListSortingStrategy}>
                        <ListFilters>
                            {filtersSorted.map(filter => (
                                <Filter key={filter.key} filter={filter} />
                            ))}
                        </ListFilters>
                    </SortableContext>
                </DndContext>
            </FiltersWrapper>
        </Wrapper>
    );
}

export default FiltersPanel;
