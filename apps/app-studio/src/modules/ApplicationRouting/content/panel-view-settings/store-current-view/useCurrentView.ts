import {useCallback, useContext, useMemo} from 'react';
import {useLang, useUser} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {
    type RecordFilterCondition,
    type SortOrder,
    type ViewV2Shortcut,
    type ViewV2Types,
} from '../../../../../__generated__';
import {CurrentViewContext} from './CurrentViewContext';
import {type AvailableAttribute, type CurrentView, getFilterId, getSortId} from './_types';

const displayFingerprint = (view: CurrentView) =>
    view
        ? JSON.stringify({
              label: view.label,
              display: view.display,
              sorts: view.sorts,
              filters: view.filters,
              shortcuts: view.shortcuts,
          })
        : null;

export const useCurrentView = () => {
    const {view, savedView, isEmptyView, canManageViews, dispatch, origin} = useContext(CurrentViewContext);
    const {lang} = useLang();
    const {userData} = useUser();

    const setViewType = useCallback(
        (viewType: ViewV2Types) => dispatch({type: 'SET_VIEW_TYPE', payload: {viewType}}),
        [dispatch],
    );

    const toggleVisibility = useCallback(
        (id: string) => dispatch({type: 'TOGGLE_VISIBILITY', payload: {id}}),
        [dispatch],
    );

    const moveAttribute = useCallback(
        (activeId: string, overId: string) => dispatch({type: 'MOVE_ATTRIBUTE', payload: {activeId, overId}}),
        [dispatch],
    );

    const moveSort = useCallback(
        (activeId: string, overId: string) => dispatch({type: 'MOVE_SORT', payload: {activeId, overId}}),
        [dispatch],
    );

    const setSortOrder = useCallback(
        (id: string, order: SortOrder) => dispatch({type: 'SET_SORT_ORDER', payload: {id, order}}),
        [dispatch],
    );

    const toggleSortActivated = useCallback(
        (id: string) => dispatch({type: 'TOGGLE_SORT_ACTIVATED', payload: {id}}),
        [dispatch],
    );

    const moveFilter = useCallback(
        (activeId: string, overId: string) => dispatch({type: 'MOVE_FILTER', payload: {activeId, overId}}),
        [dispatch],
    );

    const toggleFilterPinned = useCallback(
        (id: string) => dispatch({type: 'TOGGLE_FILTER_PINNED', payload: {id}}),
        [dispatch],
    );

    const setFilterConfig = useCallback(
        (id: string, condition: RecordFilterCondition, values: Array<string | null>, withEmptyValues?: boolean) =>
            dispatch({type: 'SET_FILTER_CONFIG', payload: {id, condition, values, withEmptyValues}}),
        [dispatch],
    );

    const setAvailableFilters = useCallback(
        (filters: Array<{attributes: AvailableAttribute[]}>) =>
            dispatch({type: 'SET_AVAILABLE_FILTERS', payload: {filters}}),
        [dispatch],
    );

    const setLabel = useCallback(
        (value: string) => dispatch({type: 'SET_LABEL', payload: {lang: lang[0], value}}),
        [dispatch, lang],
    );

    const setShared = useCallback((shared: boolean) => dispatch({type: 'SET_SHARED', payload: {shared}}), [dispatch]);

    const setDisplaySettings = useCallback(
        (settings: Record<string, unknown> | null) => dispatch({type: 'SET_DISPLAY_SETTINGS', payload: {settings}}),
        [dispatch],
    );

    const toggleShortcut = useCallback(
        (shortcut: ViewV2Shortcut) => dispatch({type: 'TOGGLE_SHORTCUT', payload: {shortcut}}),
        [dispatch],
    );

    const setAvailableColumns = useCallback(
        (attributes: AvailableAttribute[]) => dispatch({type: 'SET_AVAILABLE_COLUMNS', payload: {attributes}}),
        [dispatch],
    );

    const setAvailableSorts = useCallback(
        (sorts: Array<{attributes: AvailableAttribute[]}>) => dispatch({type: 'SET_AVAILABLE_SORTS', payload: {sorts}}),
        [dispatch],
    );

    const resetView = useCallback(() => dispatch({type: 'RESET_VIEW'}), [dispatch]);

    const markSaved = useCallback(() => dispatch({type: 'MARK_SAVED'}), [dispatch]);

    // Ownership drives the whole owner/non-owner branching of the header.
    const isOwner = view?.created_by?.whoAmI?.id === userData?.userId;

    // Management rights (save/rename/delete/share): the owner, or a user holding the manage_views
    // permission on a shared view. The override is restricted to shared views — never another user's
    // private one.
    const canManageCurrentView = isOwner || (canManageViews && (view?.shared ?? false));

    // "Dirty" = the editable label/display/filters/sorts diverged from the last persisted snapshot. `shared`,
    const isDirty = useMemo(() => displayFingerprint(view) !== displayFingerprint(savedView), [view, savedView]);

    // Visible columns keep the view-defined order. Hidden columns are sorted alphabetically.
    const visibleColumns = useMemo(() => view?.display.attributes.filter(attr => attr.visible) ?? [], [view]);

    const invisibleColumns = useMemo(() => {
        if (!view) {
            return [];
        }
        return view.display.attributes
            .filter(attr => !attr.visible)
            .slice()
            .sort((a, b) => {
                const labelA = a.attribute.label ? localizedTranslation(a.attribute.label, lang) : a.attribute.id;
                const labelB = b.attribute.label ? localizedTranslation(b.attribute.label, lang) : b.attribute.id;
                return labelA.localeCompare(labelB);
            });
    }, [view, lang]);

    const sorts = useMemo(
        () =>
            view?.sorts.map(sort => ({
                id: getSortId(sort),
                order: sort.order,
                activated: sort.activated,
                ids: sort.attributes.map(attribute => attribute.id),
                // Descent path label, e.g. "Campagnes › Thématiques". A single-attribute sort just
                // shows that attribute's label.
                label: sort.attributes.map(attribute => localizedTranslation(attribute.label ?? {}, lang)).join(' › '),
            })) ?? [],
        [view, lang],
    );

    // Activated sorts keep the view-defined order (= sort priority). Deactivated sorts are sorted
    // alphabetically. Mirrors visibleColumns / invisibleColumns.
    const activatedSorts = useMemo(() => sorts.filter(sort => sort.activated), [sorts]);

    const deactivatedSorts = useMemo(
        () =>
            sorts
                .filter(sort => !sort.activated)
                .slice()
                .sort((a, b) => a.label.localeCompare(b.label)),
        [sorts],
    );

    // The currently-available attributes per facet (= the gear selection). Columns are keyed by
    // attribute id; sorts by their descent path (array of attribute ids).
    const availableColumnIds = useMemo(() => view?.display.attributes.map(column => column.attribute.id) ?? [], [view]);

    const availableSortPaths = useMemo(
        () => view?.sorts.map(sort => sort.attributes.map(attribute => attribute.id)) ?? [],
        [view],
    );

    const filters = useMemo(
        () =>
            view?.filters.map(filter => ({
                id: getFilterId(filter),
                condition: filter.condition,
                values: filter.values,
                pinned: filter.pinned,
                ids: filter.attributes.map(attribute => attribute.id),
                // Descent path label, e.g. "Campagnes › Thématiques". A single-attribute filter just
                // shows that attribute's label.
                label: filter.attributes
                    .map(attribute => localizedTranslation(attribute.label ?? {}, lang))
                    .join(' › '),
            })) ?? [],
        [view, lang],
    );

    // Pinned filters keep the view-defined order (= toolbar order). Unpinned filters are sorted
    // alphabetically. Mirrors activatedSorts / deactivatedSorts.
    const pinnedFilters = useMemo(() => filters.filter(filter => filter.pinned), [filters]);

    const unpinnedFilters = useMemo(
        () =>
            filters
                .filter(filter => !filter.pinned)
                .slice()
                .sort((a, b) => a.label.localeCompare(b.label)),
        [filters],
    );

    const availableFilterPaths = useMemo(
        () => view?.filters.map(filter => filter.attributes.map(attribute => attribute.id)) ?? [],
        [view],
    );

    return {
        view,
        savedView,
        isEmptyView,
        origin,
        dispatch,
        isOwner,
        canManageCurrentView,
        canManageViews,
        isDirty,
        setViewType,
        toggleVisibility,
        moveAttribute,
        moveSort,
        setSortOrder,
        toggleSortActivated,
        moveFilter,
        toggleFilterPinned,
        setFilterConfig,
        setAvailableFilters,
        setLabel,
        setShared,
        setDisplaySettings,
        toggleShortcut,
        setAvailableColumns,
        setAvailableSorts,
        resetView,
        markSaved,
        visibleColumns,
        invisibleColumns,
        sorts,
        activatedSorts,
        deactivatedSorts,
        filters,
        pinnedFilters,
        unpinnedFilters,
        shortcuts: view?.shortcuts ?? [],
        availableColumnIds,
        availableSortPaths,
        availableFilterPaths,
    };
};
