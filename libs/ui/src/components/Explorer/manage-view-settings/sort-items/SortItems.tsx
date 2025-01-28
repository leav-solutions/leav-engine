// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {FaEye, FaEyeSlash, FaSearch} from 'react-icons/fa';
import {KitInput, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SortOrder} from '_ui/_gqlTypes';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {useAttributeDetailsData} from '../_shared/useAttributeDetailsData';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {SortListItem} from './SortListItem';

const StyledListContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const StyledList = styled.ul`
    padding: calc(var(--general-spacing-s) * 1px) 0;
    margin: 0;
    list-style: none;
    color: var(--general-utilities-text-primary);
`;

const StyledEyeSlash = styled(FaEyeSlash)`
    color: var(--general-utilities-neutral-dark);
`;

const StyledFaEye = styled(FaEye)`
    color: var(--general-utilities-neutral-deepDark);
`;

export const SortItems: FunctionComponent<{libraryId: string}> = ({libraryId}) => {
    const {t} = useSharedTranslation();
    const {view, dispatch} = useViewSettingsContext();

    const {onSearchChanged, searchFilteredColumnsIds, attributeDetailsById} = useAttributeDetailsData(libraryId);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const _toggleColumnVisibility = (field: string) => () => {
        const isAttributeAlreadySorting = view.sort.some(sortItem => sortItem.field === field);
        if (isAttributeAlreadySorting) {
            dispatch({
                type: ViewSettingsActionTypes.REMOVE_SORT,
                payload: {
                    field
                }
            });
        } else {
            dispatch({
                type: ViewSettingsActionTypes.ADD_SORT,
                payload: {
                    order: SortOrder.asc,
                    field
                }
            });
        }
    };

    const _changeOrderActiveFilterTo = (field: string) => (order: SortOrder) => {
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_SORT_ORDER,
            payload: {
                field,
                order
            }
        });
    };

    const _handleDragEnd = ({active: draggedElement, over: dropTarget}: DragEndEvent) => {
        const indexFrom = activeFilters.findIndex(({field}) => field === String(draggedElement.id));
        const indexTo = activeFilters.findIndex(({field}) => field === String(dropTarget?.id));

        if (!dropTarget || indexFrom === indexTo || indexTo === -1) {
            return;
        }

        dispatch({type: ViewSettingsActionTypes.MOVE_SORT, payload: {indexFrom, indexTo}});
    };

    const activeFilters = view.sort.filter(({field}) => searchFilteredColumnsIds.includes(field));
    const inactiveFilters = searchFilteredColumnsIds.filter(field =>
        view.sort.every(sortItem => sortItem.field !== field)
    );

    return (
        <StyledListContainer>
            {activeFilters.length > 0 && (
                <StyledList aria-label={t('explorer.sort-list.active')}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={_handleDragEnd}>
                        <SortableContext
                            items={activeFilters.map(({field}) => ({id: field}))}
                            strategy={verticalListSortingStrategy}
                        >
                            {activeFilters.map(({field, order}) => (
                                <SortListItem
                                    key={field}
                                    attributeId={field}
                                    isDraggable
                                    filterChipProps={{
                                        label: attributeDetailsById[field].label,
                                        values: [
                                            order === SortOrder.asc
                                                ? t('explorer.sort-ascending')
                                                : t('explorer.sort-descending')
                                        ],
                                        expandable: true,
                                        dropDownProps: {
                                            menu: {
                                                selectable: true,
                                                selectedKeys: [order],
                                                items: [
                                                    {
                                                        key: SortOrder.asc,
                                                        label: t('explorer.sort-ascending')
                                                    },
                                                    {
                                                        key: SortOrder.desc,
                                                        label: t('explorer.sort-descending')
                                                    }
                                                ],
                                                onSelect: ({selectedKeys: [newOrder]}) =>
                                                    _changeOrderActiveFilterTo(field)(newOrder as SortOrder),
                                                onDeselect: ({selectedKeys: [newOrder]}) =>
                                                    _changeOrderActiveFilterTo(field)(newOrder as SortOrder)
                                            }
                                        }
                                    }}
                                    visibilityButtonProps={{
                                        icon: <StyledFaEye />,
                                        title: String(t('explorer.hide')),
                                        onClick: _toggleColumnVisibility(field)
                                    }}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </StyledList>
            )}
            <KitTypography.Title level="h4">{t('explorer.available-attributes')}</KitTypography.Title>
            <KitInput
                placeholder={String(t('global.search'))}
                onChange={onSearchChanged}
                allowClear
                prefix={<FaSearch />}
            />
            <StyledList aria-label={t('explorer.sort-list.inactive')}>
                {inactiveFilters.map(field => (
                    <SortListItem
                        key={field}
                        attributeId={field}
                        filterChipProps={{
                            label: attributeDetailsById[field].label
                        }}
                        visibilityButtonProps={{
                            icon: <StyledEyeSlash />,
                            title: String(t('explorer.show')),
                            onClick: _toggleColumnVisibility(field)
                        }}
                    />
                ))}
            </StyledList>
        </StyledListContainer>
    );
};
