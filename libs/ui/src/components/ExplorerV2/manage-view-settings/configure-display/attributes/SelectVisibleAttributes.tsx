import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitInput, KitTypography} from 'aristid-ds';
import {type FunctionComponent} from 'react';
import styled from 'styled-components';
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
import {ColumnItem} from '../../_shared/ColumnItem';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {useAttributeDetailsData} from '../../_shared/useAttributeDetailsData';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faGripLines} from '@fortawesome/free-solid-svg-icons';

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

const visibleListTitleId = 'visibleListTitle';
const invisibleListTitleId = 'invisibleListTitle';

interface ISelectVisibleAttributesProps {
    libraryId: string;
    mainTitle: string;
    visibleListTitle: string;
    invisibleListTitle: string;
}

export const SelectVisibleAttributes: FunctionComponent<ISelectVisibleAttributesProps> = ({
    libraryId,
    mainTitle,
    visibleListTitle,
    invisibleListTitle,
}) => {
    const {t} = useSharedTranslation();
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // TODO: make naming great again
    const {
        view: {attributesIds: orderedVisibleColumns},
        dispatch,
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
            <KitTypography.Title level="h4">{mainTitle}</KitTypography.Title>
            <KitInput placeholder={String(t('global.search'))} onChange={onSearchChanged} allowClear />
            <StyledListTitle id={visibleListTitleId}>{visibleListTitle}</StyledListTitle>
            <StyledList aria-labelledby={visibleListTitleId}>
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
                                    dragHandler={<FontAwesomeIcon icon={faGripLines} />}
                                />
                            ))}
                    </SortableContext>
                </DndContext>
            </StyledList>
            <StyledListTitle id={invisibleListTitleId}>{invisibleListTitle}</StyledListTitle>
            <StyledList aria-labelledby={invisibleListTitleId}>
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
