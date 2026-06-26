import {useCallback, useContext, useMemo} from 'react';
import {useLang, useUser} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {type SortOrder, type ViewV2Shortcut, type ViewV2Types} from '../../../../../__generated__';
import {useIsAdminUser} from '../../../../../config/user/useIsAdminUser';
import {CurrentViewContext} from './CurrentViewContext';
import {type AvailableAttribute, type CurrentView, getSortId} from './_types';

const displayFingerprint = (view: CurrentView) =>
    view
        ? JSON.stringify({
              label: view.label,
              display: view.display,
              sorts: view.sorts,
              shortcuts: view.shortcuts,
          })
        : null;

export const useCurrentView = () => {
    const {view, savedView, isEmptyView, dispatch} = useContext(CurrentViewContext);
    const {lang} = useLang();
    const {userData} = useUser();
    const isAdmin = useIsAdminUser();

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

    const toggleSortPinned = useCallback(
        (id: string) => dispatch({type: 'TOGGLE_SORT_PINNED', payload: {id}}),
        [dispatch],
    );

    const setLabel = useCallback(
        (value: string) => dispatch({type: 'SET_LABEL', payload: {lang: lang[0], value}}),
        [dispatch, lang],
    );

    const setShared = useCallback((shared: boolean) => dispatch({type: 'SET_SHARED', payload: {shared}}), [dispatch]);

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

    // Management rights (save/rename/delete/share): the owner, or an admin on a shared view.
    // The admin override is restricted to shared views — never another user's private one.
    const canManageView = isOwner || (isAdmin && (view?.shared ?? false));

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
                pinned: sort.pinned,
                ids: sort.attributes.map(attribute => attribute.id),
                // Descent path label, e.g. "Campagnes › Thématiques". A single-attribute sort just
                // shows that attribute's label.
                label: sort.attributes.map(attribute => localizedTranslation(attribute.label ?? {}, lang)).join(' › '),
            })) ?? [],
        [view, lang],
    );

    // Pinned sorts keep the view-defined order (= sort priority). Unpinned sorts are sorted
    // alphabetically. Mirrors visibleColumns / invisibleColumns.
    const pinnedSorts = useMemo(() => sorts.filter(sort => sort.pinned), [sorts]);

    const unpinnedSorts = useMemo(
        () =>
            sorts
                .filter(sort => !sort.pinned)
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

    return {
        view,
        savedView,
        isEmptyView,
        dispatch,
        isOwner,
        canManageView,
        isDirty,
        setViewType,
        toggleVisibility,
        moveAttribute,
        moveSort,
        setSortOrder,
        toggleSortPinned,
        setLabel,
        setShared,
        toggleShortcut,
        setAvailableColumns,
        setAvailableSorts,
        resetView,
        markSaved,
        visibleColumns,
        invisibleColumns,
        sorts,
        pinnedSorts,
        unpinnedSorts,
        shortcuts: view?.shortcuts ?? [],
        availableColumnIds,
        availableSortPaths,
    };
};
