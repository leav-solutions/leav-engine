// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitInput, KitTypography} from 'aristid-ds';
import {FunctionComponent} from 'react';
import styled from 'styled-components';
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
import {FaGripLines} from 'react-icons/fa';
import {ColumnItem} from '../../_shared/ColumnItem';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {useAttributeDetailsData} from '../../_shared/useAttributeDetailsData';

const StyledListTitle = styled.div`
    margin-top: calc(var(--general-spacing-s) * 1px);
    font-weight: var(--general-typography-boldFontWeight);
`;

const StyledList = styled.ul`
    padding: 0;
    margin: 0;
    list-style: none;
    color: var(--general-utilities-text-primary);
`;

const visibleListTitle = 'visibleListTitle';
const invisibleListTitle = 'invisibleListTitle';

interface ISelectVisibleAttributesProps {
    libraryId: string;
}

export const SelectVisibleAttributes: FunctionComponent<ISelectVisibleAttributesProps> = ({libraryId}) => {
    const {t} = useSharedTranslation();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    // TODO: make naming great again
    const {
        view: {attributesIds: orderedVisibleColumns},
        dispatch
    } = useViewSettingsContext();

    const {attributeDetailsById, searchFilteredColumnsIds, onSearchChanged} = useAttributeDetailsData(libraryId);

    const _toggleColumnVisibility = (columnId: string) => () => {
        const actionType = orderedVisibleColumns.includes(columnId)
            ? ViewSettingsActionTypes.REMOVE_ATTRIBUTE
            : ViewSettingsActionTypes.ADD_ATTRIBUTE;

        dispatch({type: actionType, payload: {attributeId: columnId}});
    };

    const _handleDragEnd = ({active: draggedElement, over: dropTarget}: DragEndEvent) => {
        const indexFrom = orderedVisibleColumns.indexOf(String(draggedElement.id));
        const indexTo = orderedVisibleColumns.indexOf(String(dropTarget?.id));

        if (!dropTarget || indexFrom === indexTo || indexTo === -1) {
            return;
        }

        dispatch({type: ViewSettingsActionTypes.MOVE_ATTRIBUTE, payload: {indexFrom, indexTo}});
    };

    return (
        <div>
            <KitTypography.Title level="h4">{t('explorer.columns')}</KitTypography.Title>
            <KitInput placeholder={String(t('global.search'))} onChange={onSearchChanged} allowClear />
            <StyledListTitle id={visibleListTitle}>{t('explorer.visible-columns')}</StyledListTitle>
            <StyledList aria-labelledby={visibleListTitle}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={_handleDragEnd}>
                    <SortableContext items={orderedVisibleColumns} strategy={verticalListSortingStrategy}>
                        <ColumnItem itemId="" title={t('record_edition.whoAmI')} visible={false} locked />
                        {orderedVisibleColumns
                            .filter(columnId => searchFilteredColumnsIds.includes(columnId))
                            .map(columnId => (
                                <ColumnItem
                                    key={columnId}
                                    itemId={attributeDetailsById[columnId].id}
                                    title={attributeDetailsById[columnId].label}
                                    visible
                                    onVisibilityClick={_toggleColumnVisibility(columnId)}
                                    dragHandler={<FaGripLines />}
                                />
                            ))}
                    </SortableContext>
                </DndContext>
            </StyledList>
            <StyledListTitle id={invisibleListTitle}>{t('explorer.invisible-columns')}</StyledListTitle>
            <StyledList aria-labelledby={invisibleListTitle}>
                {searchFilteredColumnsIds
                    .filter(columnId => !orderedVisibleColumns.includes(columnId))
                    .map(columnId => (
                        <ColumnItem
                            key={attributeDetailsById[columnId].id}
                            itemId={attributeDetailsById[columnId].id}
                            visible={false}
                            title={attributeDetailsById[columnId].label}
                            onVisibilityClick={_toggleColumnVisibility(columnId)}
                        />
                    ))}
            </StyledList>
        </div>
    );
};
