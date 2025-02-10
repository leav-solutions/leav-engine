// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {FaEye, FaEyeSlash, FaSearch} from 'react-icons/fa';
import {KitFilter, KitInput, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {
    AttributeFormat,
    AttributesByLibAttributeFragment,
    AttributesByLibAttributeLinkAttributeFragment,
    AttributeType
} from '_ui/_gqlTypes';
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
import {CommonFilterItem} from '../_shared/CommonFilterItem';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {FilterListItem} from './FilterListItem';

const StyledListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-l) * 1px);
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

const _isLibraryLinkAttribute = (
    attribute: AttributesByLibAttributeFragment
): attribute is AttributesByLibAttributeLinkAttributeFragment =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(attribute.type) && 'linked_library' in attribute;

export const FilterItems: FunctionComponent<{libraryId: string}> = ({libraryId}) => {
    const {t} = useSharedTranslation();
    const {
        view: {filters, maxFilters},
        dispatch
    } = useViewSettingsContext();

    const {onSearchChanged, searchFilteredColumnsIds, attributeDetailsById} = useAttributeDetailsData(libraryId);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const addFilter = (attributeId: string) => () => {
        dispatch({
            type: ViewSettingsActionTypes.ADD_FILTER,
            payload: {
                field: attributeId,
                attribute: {
                    label: attributeDetailsById[attributeId].label,
                    format: attributeDetailsById[attributeId].format ?? AttributeFormat.text,
                    type: attributeDetailsById[attributeId].type,
                    linkedLibrary: _isLibraryLinkAttribute(attributeDetailsById[attributeId])
                        ? (attributeDetailsById[attributeId].linked_library ?? undefined)
                        : undefined // TODO : https://aristid.atlassian.net/browse/XSTREAM-1155
                }
            }
        });
    };

    const removeFilter = (filterId: string) => () => {
        dispatch({
            type: ViewSettingsActionTypes.REMOVE_FILTER,
            payload: {
                id: filterId
            }
        });
    };

    const _handleDragEnd = ({active: draggedElement, over: dropTarget}: DragEndEvent) => {
        const indexFrom = activeFilters.findIndex(({field}) => field === String(draggedElement.id));
        const indexTo = activeFilters.findIndex(({field}) => field === String(dropTarget?.id));

        if (!dropTarget || indexFrom === indexTo || indexTo === -1) {
            return;
        }

        dispatch({type: ViewSettingsActionTypes.MOVE_FILTER, payload: {indexFrom, indexTo}});
    };

    const ignoredTypes = [AttributeType.tree];
    const activeFilters = filters.filter(({field}) => searchFilteredColumnsIds.includes(field));
    const inactiveFilters = searchFilteredColumnsIds.filter(
        attributeId =>
            !ignoredTypes.includes(attributeDetailsById?.[attributeId]?.type) &&
            filters.every(filterItem => filterItem.field !== attributeId)
    );

    const canAddFilter = activeFilters.length < maxFilters;

    return (
        <StyledListContainer>
            {activeFilters.length > 0 && (
                <StyledList aria-label={t('explorer.filter-list.active')}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={_handleDragEnd}>
                        <SortableContext
                            items={activeFilters.map(({field}) => ({id: field}))}
                            strategy={verticalListSortingStrategy}
                        >
                            {activeFilters.map(activeFilter => (
                                <FilterListItem
                                    key={activeFilter.field}
                                    attributeId={activeFilter.field}
                                    isDraggable
                                    visibilityButtonProps={{
                                        icon: <StyledFaEye />,
                                        title: String(t('explorer.hide')),
                                        onClick: removeFilter(activeFilter.id)
                                    }}
                                >
                                    <CommonFilterItem filter={activeFilter} />
                                </FilterListItem>
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
            <StyledList aria-label={t('explorer.filter-list.inactive')}>
                {inactiveFilters.map(attributeId => (
                    <FilterListItem
                        key={attributeId}
                        attributeId={attributeId}
                        visibilityButtonProps={
                            canAddFilter
                                ? {
                                      icon: <StyledEyeSlash />,
                                      title: String(t('explorer.show')),
                                      onClick: addFilter(attributeId)
                                  }
                                : undefined
                        }
                    >
                        <KitFilter label={attributeDetailsById[attributeId].label} disabled={!canAddFilter} />
                    </FilterListItem>
                ))}
            </StyledList>
        </StyledListContainer>
    );
};
