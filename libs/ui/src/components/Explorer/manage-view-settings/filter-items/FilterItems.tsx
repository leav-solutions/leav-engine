// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {FaEye, FaEyeSlash, FaSearch} from 'react-icons/fa';
import {KitInput, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {AttributeType, SortOrder} from '_ui/_gqlTypes';
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
import {FilterListItem} from './FilterListItem';
import {SimpleFilterDropdown} from './filter-type/SimpleFilterDropDown';

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

export const FilterItems: FunctionComponent<{libraryId: string; maxFilters: number}> = ({libraryId, maxFilters}) => {
    const {t} = useSharedTranslation();
    const {
        view: {filter},
        dispatch
    } = useViewSettingsContext();

    const {onSearchChanged, searchFilteredColumnsIds, attributeDetailsById} = useAttributeDetailsData(libraryId);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const canAddFilter = filter.length < maxFilters;

    const _toggleColumnVisibility = (attributeId: string) => () => {
        const isAttributeAlreadySorting = filter.some(filterItem => filterItem.field === attributeId);
        if (isAttributeAlreadySorting) {
            dispatch({
                type: ViewSettingsActionTypes.REMOVE_FILTER,
                payload: {
                    field: attributeId
                }
            });
        } else {
            if (canAddFilter) {
                dispatch({
                    type: ViewSettingsActionTypes.ADD_FILTER,
                    payload: {
                        operator: '',
                        values: [],
                        field: attributeId
                    }
                });
            }
        }
    };

    const _handleDragEnd = ({active: draggedElement, over: dropTarget}: DragEndEvent) => {
        const indexFrom = activeFilters.findIndex(({field}) => field === String(draggedElement.id));
        const indexTo = activeFilters.findIndex(({field}) => field === String(dropTarget?.id));

        if (!dropTarget || indexFrom === indexTo || indexTo === -1) {
            return;
        }

        dispatch({type: ViewSettingsActionTypes.MOVE_FILTER, payload: {indexFrom, indexTo}});
    };

    const activeFilters = filter.filter(({field}) => searchFilteredColumnsIds.includes(field));
    const inactiveFilters = searchFilteredColumnsIds.filter(
        attributeId =>
            attributeDetailsById?.[attributeId]?.type === AttributeType.simple &&
            filter.every(filterItem => filterItem.field !== attributeId)
    );

    return (
        <>
            {activeFilters.length > 0 && (
                <StyledList aria-label={t('explorer.sort-list.active')}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={_handleDragEnd}>
                        <SortableContext
                            items={activeFilters.map(({field}) => ({id: field}))}
                            strategy={verticalListSortingStrategy}
                        >
                            {activeFilters.map(({field, operator, values}) => (
                                <FilterListItem
                                    key={field}
                                    attributeId={field}
                                    isDraggable
                                    filterChipProps={{
                                        label: attributeDetailsById[field].label,
                                        expandable: true,
                                        values,
                                        dropDownProps: {
                                            dropdownRender: () => (
                                                <SimpleFilterDropdown
                                                    filter={{field, operator, values}}
                                                    attribute={attributeDetailsById[field]}
                                                />
                                            )
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
                {inactiveFilters.map(attributeId => (
                    <FilterListItem
                        key={attributeId}
                        attributeId={attributeId}
                        filterChipProps={{
                            label: attributeDetailsById[attributeId].label,
                            disabled: !canAddFilter
                        }}
                        visibilityButtonProps={
                            canAddFilter
                                ? {
                                      icon: <StyledEyeSlash />,
                                      title: String(t('explorer.show')),
                                      onClick: _toggleColumnVisibility(attributeId)
                                  }
                                : undefined
                        }
                    />
                ))}
            </StyledList>
        </>
    );
};
