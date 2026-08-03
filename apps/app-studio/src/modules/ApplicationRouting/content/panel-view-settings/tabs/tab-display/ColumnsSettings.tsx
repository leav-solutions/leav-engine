import {type ChangeEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {KitDivider, KitInput, KitTypography} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
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
import {restrictToParentElement, restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {ColumnItem} from './ColumnItem';
import {IDENTITY_COLUMN_ID} from './_constants';
import {ViewV2Types} from '../../../../../../__generated__';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {AvailableAttributesDropdown} from '../../manage-available-attributes/AvailableAttributesDropdown';
import {section, header, lists, list} from './columnsSettings.module.css';
import {type CurrentViewColumn} from '../../store-current-view/_types';

export const ColumnsSettings = ({
    search,
    visibleColumns,
    invisibleColumns,
    onSearchChange,
    onToggleVisibility,
    onMoveAttribute,
}: {
    search: string;
    visibleColumns: CurrentViewColumn[];
    invisibleColumns: CurrentViewColumn[];
    onSearchChange: (search: string) => void;
    onToggleVisibility: (id: string) => void;
    onMoveAttribute: (activeId: string, overId: string) => void;
}) => {
    const {t} = useTranslation();
    const {lang} = useLang();

    const {view, canManageViews} = useCurrentView();

    // In a table these are columns; in a kanban they are the attributes displayed on each card, not
    // columns — so the section title follows the display mode.
    const isKanban = view?.display.type === ViewV2Types.kanban;
    const titleKey = isKanban ? 'view_settings.display.columns.title_kanban' : 'view_settings.display.columns.title';

    const getLabel = (attr: CurrentViewColumn) =>
        attr.attribute.label ? localizedTranslation(attr.attribute.label, lang) : attr.attribute.id;

    // Derive the sortable ids from the rendered visible list so SortableContext items always match
    // the DOM order (incl. under search), preventing dnd-kit desyncs.
    const visibleIds = visibleColumns.map(attr => attr.attribute.id);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value);

    const handleDragEnd = ({active, over}: DragEndEvent) => {
        if (over && active.id !== over.id) {
            onMoveAttribute(String(active.id), String(over.id));
        }
    };

    return (
        <div className={section}>
            <header className={header}>
                <KitTypography.Text weight="bold" size="fontSize5">
                    {t(titleKey)}
                </KitTypography.Text>
                {canManageViews && <AvailableAttributesDropdown facet="columns" />}
            </header>
            <KitInput
                placeholder={String(t('view_settings.display.columns.search_placeholder'))}
                value={search}
                onChange={handleSearchChange}
                prefix={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                allowClear
            />
            <div className={lists}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                    <SortableContext items={visibleIds} strategy={verticalListSortingStrategy}>
                        <ul className={list}>
                            <ColumnItem
                                id={IDENTITY_COLUMN_ID}
                                title={t('view_settings.display.columns.identity')}
                                visible
                                locked
                            />
                            {visibleColumns.map(attr => (
                                <ColumnItem
                                    key={attr.attribute.id}
                                    id={attr.attribute.id}
                                    title={getLabel(attr)}
                                    visible
                                    draggable
                                    onToggleVisibility={() => onToggleVisibility(attr.attribute.id)}
                                />
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
                {invisibleColumns.length > 0 && <KitDivider noMargin />}
                <ul className={list}>
                    {invisibleColumns.map(attr => (
                        <ColumnItem
                            key={attr.attribute.id}
                            id={attr.attribute.id}
                            title={getLabel(attr)}
                            visible={false}
                            onToggleVisibility={() => onToggleVisibility(attr.attribute.id)}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};
