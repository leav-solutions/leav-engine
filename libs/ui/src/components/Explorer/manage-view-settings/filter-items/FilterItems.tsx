// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {KitFilter, KitInput, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {
    AttributeFormat,
    type AttributesByLibAttributeFragment,
    type AttributesByLibAttributeLinkAttributeFragment,
    type AttributesByLibAttributeTreeAttributeFragment,
    AttributeType,
} from '_ui/_gqlTypes';
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {useAttributeDetailsData} from '../_shared/useAttributeDetailsData';
import {FiltersActionTypes} from '_ui/components/Filters/context/filtersReducer';
import {FilterListItem} from './FilterListItem';
import {CommonFilterItem} from '_ui/components/Filters/filter-items/CommonFilterItem';
import {useFiltersContext} from '_ui/components/Filters/useFiltersContext';
import {type IUIFilterBaseAttribute, type UIFilter} from '_ui/components/Filters/_types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEye, faEyeSlash, faSearch} from '@fortawesome/free-solid-svg-icons';

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

const StyledEyeSlash = styled(FontAwesomeIcon)`
    color: var(--general-utilities-neutral-dark);
`;

const StyledFaEye = styled(FontAwesomeIcon)`
    color: var(--general-utilities-neutral-deepDark);
`;

const _isLibraryLinkAttribute = (
    attribute: AttributesByLibAttributeFragment,
): attribute is AttributesByLibAttributeLinkAttributeFragment =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(attribute.type) && 'linked_library' in attribute;

const _isLibraryTreeAttribute = (
    attribute: AttributesByLibAttributeFragment,
): attribute is AttributesByLibAttributeTreeAttributeFragment =>
    attribute.type === AttributeType.tree && 'linked_tree' in attribute;

export const FilterItems: FunctionComponent<{libraryId: string}> = ({libraryId}) => {
    const {t} = useSharedTranslation();
    const {
        filtersData: {filters},
        dispatch,
    } = useFiltersContext();

    const {onSearchChanged, searchFilteredColumnsIds, attributeDetailsById} = useAttributeDetailsData(libraryId);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const addFilter = (attributeId: string) => () => {
        dispatch({
            type: FiltersActionTypes.ADD_FILTER,
            payload: {
                field: attributeId,
                attribute: {
                    id: attributeId,
                    label: attributeDetailsById[attributeId].label,
                    format: attributeDetailsById[attributeId].format ?? AttributeFormat.text,
                    type: attributeDetailsById[attributeId].type,
                    valuesList: (attributeDetailsById[attributeId] as IUIFilterBaseAttribute).valuesList,
                    linkedLibrary: _isLibraryLinkAttribute(attributeDetailsById[attributeId])
                        ? (attributeDetailsById[attributeId].linked_library ?? undefined)
                        : undefined, // TODO : https://aristid.atlassian.net/browse/XSTREAM-1155
                    linkedTree: _isLibraryTreeAttribute(attributeDetailsById[attributeId])
                        ? (attributeDetailsById[attributeId].linked_tree ?? undefined)
                        : undefined,
                    smartFilter:
                        'smart_filter' in attributeDetailsById[attributeId]
                            ? attributeDetailsById[attributeId].smart_filter
                            : undefined,
                },
            },
        });
    };

    const removeFilter = (filterId: string) => () => {
        dispatch({
            type: FiltersActionTypes.REMOVE_FILTER,
            payload: {
                id: filterId,
            },
        });
    };

    const _handleDragEnd = ({active: draggedElement, over: dropTarget}: DragEndEvent) => {
        const indexFrom = activeFilters.findIndex(({field}) =>
            Array.isArray(field) ? field.includes(String(draggedElement.id)) : field === String(draggedElement.id),
        );
        const indexTo = activeFilters.findIndex(({field}) =>
            Array.isArray(field) ? field.includes(String(dropTarget?.id)) : field === String(dropTarget?.id),
        );
        if (!dropTarget || indexFrom === indexTo || indexTo === -1) {
            return;
        }

        dispatch({type: FiltersActionTypes.MOVE_FILTER, payload: {indexFrom, indexTo}});
    };

    const activeFilters = filters.filter(({attribute}) => searchFilteredColumnsIds.includes(attribute.id));
    const inactiveFilters = searchFilteredColumnsIds.filter(
        attributeId =>
            filters.every(filterItem => filterItem.attribute.id !== attributeId) &&
            !('compute' in attributeDetailsById[attributeId] && attributeDetailsById[attributeId]?.compute),
    );

    if (!Object.keys(attributeDetailsById).length) {
        return <></>;
    }

    return (
        <StyledListContainer>
            {activeFilters.length > 0 && (
                <StyledList aria-label={t('explorer.filter-list.active')}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={_handleDragEnd}>
                        <SortableContext
                            items={activeFilters.map(({attribute}) => attribute.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {activeFilters.map(activeFilter => (
                                <FilterListItem
                                    key={activeFilter.attribute.id}
                                    attributeId={activeFilter.attribute.id}
                                    isDraggable
                                    visibilityButtonProps={{
                                        icon: <StyledFaEye icon={faEye} />,
                                        title: String(t('explorer.hide')),
                                        onClick: removeFilter(activeFilter.id),
                                    }}
                                >
                                    <CommonFilterItem
                                        filter={
                                            {
                                                ...activeFilter,
                                                attribute: {
                                                    ...activeFilter.attribute,
                                                    ...attributeDetailsById[activeFilter?.attribute?.id],
                                                },
                                            } as UIFilter
                                        }
                                    />
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
                prefix={<FontAwesomeIcon icon={faSearch} />}
            />
            <StyledList aria-label={t('explorer.filter-list.inactive')}>
                {inactiveFilters.map(attributeId => (
                    <FilterListItem
                        key={attributeId}
                        attributeId={attributeId}
                        visibilityButtonProps={{
                            icon: <StyledEyeSlash icon={faEyeSlash} />,
                            title: String(t('explorer.show')),
                            onClick: addFilter(attributeId),
                        }}
                    >
                        <KitFilter label={attributeDetailsById[attributeId].label} />
                    </FilterListItem>
                ))}
            </StyledList>
        </StyledListContainer>
    );
};
