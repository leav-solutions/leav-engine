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
    const {
        view: {sort},
        dispatch
    } = useViewSettingsContext();

    const {onSearchChanged, searchFilteredColumnsIds, attributeDetailsById} = useAttributeDetailsData(libraryId);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const _toggleColumnVisibility = (attributeId: string) => () => {
        const isAttributeAlreadySorting = sort.some(sortItem => sortItem.attributeId === attributeId);
        if (isAttributeAlreadySorting) {
            dispatch({
                type: ViewSettingsActionTypes.REMOVE_SORT,
                payload: {
                    attributeId
                }
            });
        } else {
            dispatch({
                type: ViewSettingsActionTypes.ADD_SORT,
                payload: {
                    order: SortOrder.asc,
                    attributeId
                }
            });
        }
    };

    const _changeOrderActiveFilterTo = (attributeId: string) => (order: SortOrder) => {
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_SORT_ORDER,
            payload: {
                attributeId,
                order
            }
        });
    };

    const _handleDragEnd = ({active: draggedElement, over: dropTarget}: DragEndEvent) => {
        const indexFrom = activeFilters.findIndex(({attributeId}) => attributeId === String(draggedElement.id));
        const indexTo = activeFilters.findIndex(({attributeId}) => attributeId === String(dropTarget?.id));

        if (!dropTarget || indexFrom === indexTo || indexTo === -1) {
            return;
        }

        dispatch({type: ViewSettingsActionTypes.MOVE_SORT, payload: {indexFrom, indexTo}});
    };

    const activeFilters = sort.filter(({attributeId}) => searchFilteredColumnsIds.includes(attributeId));
    const inactiveFilters = searchFilteredColumnsIds.filter(attributeId =>
        sort.every(sortItem => sortItem.attributeId !== attributeId)
    );

    return (
        <>
            {activeFilters.length > 0 && (
                <StyledList aria-label={t('explorer.sort-list.active')}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={_handleDragEnd}>
                        <SortableContext
                            items={activeFilters.map(({attributeId}) => ({id: attributeId}))}
                            strategy={verticalListSortingStrategy}
                        >
                            {activeFilters.map(({attributeId, order}) => (
                                <SortListItem
                                    key={attributeId}
                                    attributeId={attributeId}
                                    isDraggable
                                    filterChipProps={{
                                        label: attributeDetailsById[attributeId].label,
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
                                                    _changeOrderActiveFilterTo(attributeId)(newOrder as SortOrder),
                                                onDeselect: ({selectedKeys: [newOrder]}) =>
                                                    _changeOrderActiveFilterTo(attributeId)(newOrder as SortOrder)
                                            }
                                        }
                                    }}
                                    visibilityButtonProps={{
                                        icon: <StyledFaEye />,
                                        title: String(t('explorer.hide')),
                                        onClick: _toggleColumnVisibility(attributeId)
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
                {inactiveFilters.map(attributeId => (
                    <SortListItem
                        key={attributeId}
                        attributeId={attributeId}
                        filterChipProps={{
                            label: attributeDetailsById[attributeId].label
                        }}
                        visibilityButtonProps={{
                            icon: <StyledEyeSlash />,
                            title: String(t('explorer.show')),
                            onClick: _toggleColumnVisibility(attributeId)
                        }}
                    />
                ))}
            </StyledList>
        </>
    );
};
