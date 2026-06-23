import {KitFilter} from 'aristid-ds';
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
import {tab, list, sortFilter} from './tabSorts.module.css';

// TODO (admin): configure available attributes for sorts, add/remove from the active sorts list
export const TabSorts = ({canEditAdminView}: {canEditAdminView: boolean}) => {
    const {t} = useSharedTranslation();
    const {sorts, moveSort, setSortOrder} = useCurrentView();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    // The order of the sorts list IS the order in which sorts are applied in the explorer.
    const handleDragEnd = ({active, over}: DragEndEvent) => {
        if (over && active.id !== over.id) {
            moveSort(String(active.id), String(over.id));
        }
    };

    return (
        <div className={tab}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
                <SortableContext items={sorts.map(sort => sort.id)} strategy={verticalListSortingStrategy}>
                    <ul className={list}>
                        {sorts.map(sort => (
                            <SortItem key={sort.id} id={sort.id}>
                                <KitFilter
                                    className={sortFilter}
                                    expandable
                                    showSingleValue
                                    label={sort.label}
                                    values={[
                                        sort.order === SortOrder.asc
                                            ? t('explorer.sort-ascending')
                                            : t('explorer.sort-descending'),
                                    ]}
                                    dropDownProps={{
                                        menu: {
                                            selectable: true,
                                            selectedKeys: [sort.order],
                                            items: [
                                                {
                                                    key: SortOrder.asc,
                                                    label: t('explorer.sort-ascending'),
                                                },
                                                {
                                                    key: SortOrder.desc,
                                                    label: t('explorer.sort-descending'),
                                                },
                                            ],
                                            onSelect: ({selectedKeys: [selectedOrder]}) =>
                                                setSortOrder(sort.id, selectedOrder as SortOrder),
                                        },
                                    }}
                                />
                            </SortItem>
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
        </div>
    );
};
