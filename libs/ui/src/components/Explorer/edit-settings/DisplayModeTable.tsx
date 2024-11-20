// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useDebouncedValue} from '_ui/hooks/useDebouncedValue/useDebouncedValue';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitInput, KitTypography} from 'aristid-ds';
import {ChangeEvent, FunctionComponent, useMemo, useState} from 'react';
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
import {ColumnItem} from './ColumnItem';
import {useGetLibraryColumns} from './useGetLibraryColumns';
import {ViewSettingsActionTypes} from '../edit-settings/viewSettingsReducer';
import {useViewSettings} from '../edit-settings/useViewSettings';

const StyledList = styled.ul`
    padding: 0;
    margin: 0;
    list-style: none;
    color: var(--general-utilities-text-primary);
`;

const StyledDivider = styled.hr`
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid var(--general-utilities-main-light);
    margin: 0 calc(var(--general-spacing-s) * 1px);
    padding: 0;
`;

interface IDisplayModeTableProps {
    library: string;
}

export const DisplayModeTable: FunctionComponent<IDisplayModeTableProps> = ({library}) => {
    const {t} = useSharedTranslation();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const {view, dispatch} = useViewSettings();
    const {fields: orderedVisibleColumns} = view;

    const [searchInput, setSearchInput] = useState('');
    const debouncedSearchInput = useDebouncedValue(searchInput, 300);

    const {attributeDetailsById} = useGetLibraryColumns(library);

    const searchFilteredColumns = useMemo(() => {
        const columnIds = Object.keys(attributeDetailsById);
        if (columnIds.length === 0) {
            return {};
        }
        if (searchInput === '') {
            return attributeDetailsById;
        }

        return columnIds.reduce((acc, columnId) => {
            if (attributeDetailsById[columnId].label.includes(searchInput) || columnId.includes(searchInput)) {
                acc[columnId] = attributeDetailsById[columnId];
            }
            return acc;
        }, {});
    }, [debouncedSearchInput, attributeDetailsById]);
    const searchFilteredColumnsIds = Object.keys(searchFilteredColumns);

    const _onSearchChanged = (event: ChangeEvent<HTMLInputElement>) => {
        const shouldIgnoreInputChange = event.target.value.length < 3 && searchInput.length < 3;
        if (shouldIgnoreInputChange) {
            return;
        }
        setSearchInput(() => {
            if (event.target.value.length > 2) {
                return event.target.value;
            }
            return '';
        });
    };

    const _toggleColumnVisibility = (columnId: string) => () => {
        const actionType = orderedVisibleColumns.includes(columnId)
            ? ViewSettingsActionTypes.REMOVE_FIELD
            : ViewSettingsActionTypes.ADD_FIELD;
        dispatch({type: actionType, field: columnId});
    };

    const _handleDragEnd = ({active: draggedElement, over: dropTarget}: DragEndEvent) => {
        const indexFrom = orderedVisibleColumns.indexOf(String(draggedElement.id));
        const indexTo = orderedVisibleColumns.indexOf(String(dropTarget?.id));

        if (!dropTarget || indexFrom === indexTo || indexTo === -1) {
            return;
        }

        dispatch({type: ViewSettingsActionTypes.MOVE_FIELD, indexFrom, indexTo});
    };

    return (
        <div>
            <KitTypography.Title level="h4">{t('items_list.columns')}</KitTypography.Title>
            <KitInput placeholder={String(t('global.search'))} onChange={_onSearchChanged} allowClear></KitInput>
            <div>
                <StyledList>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={_handleDragEnd}>
                        <SortableContext items={orderedVisibleColumns} strategy={verticalListSortingStrategy}>
                            <ColumnItem itemId="" title={t('record_edition.whoAmI')} visible={false} disabled />
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
                <StyledDivider />
                <StyledList>
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
        </div>
    );
};
