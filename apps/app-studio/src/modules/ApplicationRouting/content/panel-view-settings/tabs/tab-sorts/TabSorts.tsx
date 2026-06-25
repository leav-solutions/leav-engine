import {KitDivider, KitFilter, KitSection, KitTypography} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
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
import {SortOrder} from '_ui/_gqlTypes';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {SortItem} from './SortItem';
import {tab, lists, list, sortFilter, emptyBox} from './tabSorts.module.css';

// The admin "available attributes" gear for sorts lives in the shared TabHeader (left of the pin),
// not here — see TabHeader. This tab only renders the list of configured sorts.
export const TabSorts = () => {
    const {t} = useSharedTranslation();
    const {sorts, pinnedSorts, unpinnedSorts, moveSort, setSortOrder, toggleSortPinned} = useCurrentView();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    // The order of the pinned sorts list IS the order in which sorts are applied in the explorer.
    const handleDragEnd = ({active, over}: DragEndEvent) => {
        if (over && active.id !== over.id) {
            moveSort(String(active.id), String(over.id));
        }
    };

    const renderSortFilter = (sort: (typeof sorts)[number], disabled: boolean = false) => (
        <KitFilter
            className={sortFilter}
            expandable
            showSingleValue
            disabled={disabled}
            label={sort.label}
            values={[sort.order === SortOrder.asc ? t('explorer.sort-ascending') : t('explorer.sort-descending')]}
            dropDownProps={{
                menu: {
                    selectable: true,
                    selectedKeys: [sort.order],
                    items: [
                        {key: SortOrder.asc, label: t('explorer.sort-ascending')},
                        {key: SortOrder.desc, label: t('explorer.sort-descending')},
                    ],
                    onSelect: ({selectedKeys: [selectedOrder]}) => setSortOrder(sort.id, selectedOrder as SortOrder),
                },
            }}
        />
    );

    if (sorts.length === 0) {
        return (
            <KitSection className={emptyBox}>
                <KitTypography.Text size="fontSize7">{t('explorer.sorts-empty')}</KitTypography.Text>
            </KitSection>
        );
    }

    return (
        <div className={tab}>
            <div className={lists}>
                {pinnedSorts.length > 0 && (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                    >
                        <SortableContext
                            items={pinnedSorts.map(sort => sort.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul className={list}>
                                {pinnedSorts.map(sort => (
                                    <SortItem
                                        key={sort.id}
                                        id={sort.id}
                                        pinned
                                        onTogglePinned={() => toggleSortPinned(sort.id)}
                                    >
                                        {renderSortFilter(sort)}
                                    </SortItem>
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                )}
                {pinnedSorts.length > 0 && unpinnedSorts.length > 0 && <KitDivider noMargin />}
                {unpinnedSorts.length > 0 && (
                    <ul className={list}>
                        {unpinnedSorts.map(sort => (
                            <SortItem
                                key={sort.id}
                                id={sort.id}
                                pinned={false}
                                draggable={false}
                                onTogglePinned={() => toggleSortPinned(sort.id)}
                            >
                                {renderSortFilter(sort, true)}
                            </SortItem>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
