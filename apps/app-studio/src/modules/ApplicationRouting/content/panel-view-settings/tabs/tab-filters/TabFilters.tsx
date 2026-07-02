import {type ChangeEvent, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {KitDivider, KitInput, KitSection, KitTypography} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {CommonFilterItem, type UIFilter, useFiltersContext} from '@leav/ui';
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
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {sanitize} from '../tab-display/_constants';
import {FilterItem} from './FilterItem';
import {tab, search as searchClass, lists, list, filterChip, emptyBox} from './tabFilters.module.css';

/**
 * Filters tab. Structure (available/pinned/order, search, DnD) is read from the current-view store
 * (`useCurrentView`). The VALUE editor reuses `@leav/ui`'s `CommonFilterItem`, wired to the volet's OWN
 * `FiltersContext` (mounted by `VoletFiltersProvider`, scoped to the volet — Spoke A of the hub & spoke,
 * ADR-006 / LEAVC-810). Editing a pinned filter here writes the value back to the hub (current-view
 * store); ExplorerV2's separate store adopts it (and vice-versa) with full fidelity (values list, tree
 * nodes, badge). Per product decision, only PINNED filters are value-editable; unpinned ones show their
 * stored value read-only with a pin button.
 */
export const TabFilters = () => {
    const {t: tShared} = useSharedTranslation();
    const {t} = useTranslation();
    const {filters, pinnedFilters, unpinnedFilters, moveFilter, toggleFilterPinned} = useCurrentView();
    const {filtersData} = useFiltersContext();

    const [searchValue, setSearchValue] = useState('');

    // The volet's filter store holds the pinned filters as fully-built UIFilters (id = attribute path),
    // seeded by VoletFiltersProvider. Look them up by id to render the live editor.
    const storeFilterById = useMemo(
        () => new Map((filtersData?.filters as UIFilter[] | undefined)?.map(filter => [filter.id, filter]) ?? []),
        [filtersData],
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    // The order of the pinned filters list IS the order in which the chips appear in the toolbar.
    const handleDragEnd = ({active, over}: DragEndEvent) => {
        if (over && active.id !== over.id) {
            moveFilter(String(active.id), String(over.id));
        }
    };

    const sanitizedSearch = sanitize(searchValue.trim());
    const matchesSearch = (label: string) => !sanitizedSearch || sanitize(label).includes(sanitizedSearch);
    const displayedPinned = useMemo(
        () => pinnedFilters.filter(filter => matchesSearch(filter.label)),
        [pinnedFilters, sanitizedSearch],
    );
    const displayedUnpinned = useMemo(
        () => unpinnedFilters.filter(filter => matchesSearch(filter.label)),
        [unpinnedFilters, sanitizedSearch],
    );

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => setSearchValue(event.target.value);

    // Pinned → live editor from the shared store (real CommonFilterItem dispatch). Fallback to a label
    // chip while the store is still seeding the filter.
    const renderPinnedFilter = (filter: (typeof filters)[number]) => {
        const uiFilter = storeFilterById.get(filter.id);
        if (!uiFilter) {
            return <KitTypography.Text size="fontSize7">{filter.label}</KitTypography.Text>;
        }
        return <CommonFilterItem filter={uiFilter} isPinned className={filterChip} />;
    };

    // Unpinned → read-only CommonFilterItem from the shared store (dropdown disabled via `disabled`), so
    // it displays the same rich value formatting as the pinned editor (tree labels, "non défini", dates).
    // Fallback to a label chip while the store is still seeding the filter.
    const renderUnpinnedFilter = (filter: (typeof filters)[number]) => {
        const uiFilter = storeFilterById.get(filter.id);
        if (!uiFilter) {
            return <KitTypography.Text size="fontSize7">{filter.label}</KitTypography.Text>;
        }
        return <CommonFilterItem filter={uiFilter} disabled className={filterChip} />;
    };

    if (filters.length === 0) {
        return (
            <KitSection className={emptyBox}>
                <KitTypography.Text size="fontSize7">{tShared('explorer.filters-empty')}</KitTypography.Text>
            </KitSection>
        );
    }

    return (
        <div className={tab}>
            <KitInput
                className={searchClass}
                placeholder={String(t('view_settings.filters.search_placeholder'))}
                value={searchValue}
                onChange={handleSearchChange}
                prefix={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                allowClear
            />
            <div className={lists}>
                {displayedPinned.length > 0 && (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                    >
                        <SortableContext
                            items={displayedPinned.map(filter => filter.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul className={list}>
                                {displayedPinned.map(filter => (
                                    <FilterItem
                                        key={filter.id}
                                        id={filter.id}
                                        pinned
                                        onTogglePinned={() => toggleFilterPinned(filter.id)}
                                    >
                                        {renderPinnedFilter(filter)}
                                    </FilterItem>
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                )}
                {displayedPinned.length > 0 && displayedUnpinned.length > 0 && <KitDivider noMargin />}
                {displayedUnpinned.length > 0 && (
                    <ul className={list}>
                        {displayedUnpinned.map(filter => (
                            <FilterItem
                                key={filter.id}
                                id={filter.id}
                                pinned={false}
                                draggable={false}
                                onTogglePinned={() => toggleFilterPinned(filter.id)}
                            >
                                {renderUnpinnedFilter(filter)}
                            </FilterItem>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
