import {arrayMove} from '@dnd-kit/sortable';
import {RecordFilterCondition, SortOrder, ViewV2Shortcut, ViewV2Types} from '../../../../../__generated__';
import {IDENTITY_COLUMN_ID} from '../tabs/tab-display/_constants';
import {DEFAULT_DRAFT_VIEW_ID} from './_constants';
import {type CurrentViewAction, type CurrentView, type ICurrentViewState, getFilterId, getSortId} from './_types';

/**
 * A freshly made-available filter has no value yet. `condition` is `RecordFilterCondition!` server-side
 * (it cannot be null), so we seed it with a neutral `EQUAL`: with an empty value list it filters
 * nothing (prepareFiltersForRequest skips value-less EQUAL filters), and the user picks the real
 * condition when they edit the value. Mirrors `SortOrder.asc` being the default for a new sort.
 */
const DEFAULT_FILTER_CONDITION = RecordFilterCondition.EQUAL;

export const initialCurrentViewState: ICurrentViewState = {view: null, savedView: null};

/**
 * Builds a synthetic, empty-but-editable "default view" draft for the admin empty state. Shaped like
 * the `AppStudioViewSettingsView` fragment so every consumer (tabs, header, serializer) treats it as a
 * regular view. `library` is the displayed library so the admin gear's attributes query resolves.
 */
export const createDefaultView = (
    library: string,
    createdBy: {id: string; label: string},
): NonNullable<CurrentView> => ({
    id: DEFAULT_DRAFT_VIEW_ID,
    library,
    label: {},
    shared: false,
    shortcuts: [ViewV2Shortcut.display],
    created_by: {id: createdBy.id, whoAmI: {id: createdBy.id, label: createdBy.label}},
    display: {type: ViewV2Types.list, attributes: []},
    sorts: [],
    filters: [],
});

/**
 * Pure reducer over a single (non-null) view, handling the display-only actions shared by every
 * tab. Extracted from the top-level reducer so its behaviour can be tested in isolation and reused
 * by the wrapper below.
 */
const viewReducer = (view: NonNullable<CurrentView>, action: CurrentViewAction): NonNullable<CurrentView> => {
    switch (action.type) {
        case 'SET_VIEW_TYPE':
            return {...view, display: {...view.display, type: action.payload.viewType}};
        case 'TOGGLE_VISIBILITY': {
            const {id} = action.payload;
            const index = view.display.attributes.findIndex(attr => attr.attribute.id === id);

            if (index === -1) {
                return view;
            }

            const target = view.display.attributes[index];

            if (target.visible) {
                // Hiding: flip the flag in place. The array position is irrelevant for hidden
                // attributes since the invisible list is re-sorted alphabetically by the selector.
                const attributes = view.display.attributes.toSpliced(index, 1, {...target, visible: false});

                return {...view, display: {...view.display, attributes}};
            }

            // Showing: flip AND move just after the last visible attribute, so it appends to the
            // end of the visible group (mirrors the previous `[...visibleIds, id]` UX).
            const withoutTarget = view.display.attributes.filter((_, i) => i !== index);
            const lastVisiblePos = withoutTarget.findLastIndex(attr => attr.visible);
            const attributes = withoutTarget.toSpliced(lastVisiblePos + 1, 0, {...target, visible: true});

            return {...view, display: {...view.display, attributes}};
        }
        case 'MOVE_ATTRIBUTE': {
            const {activeId, overId} = action.payload;

            if (activeId === overId) {
                return view;
            }

            // Both ids are necessarily visible (the DnD only runs over the visible SortableContext).
            const visible = view.display.attributes.filter(attr => attr.visible);
            const from = visible.findIndex(attr => attr.attribute.id === activeId);
            const to = visible.findIndex(attr => attr.attribute.id === overId);

            if (from === -1 || to === -1 || from === to) {
                return view;
            }

            const reordered = arrayMove(visible, from, to);

            // Re-inject the reordered visible items into their (invariant) visible slots; hidden
            // attributes keep their positions.
            let cursor = 0;
            const attributes = view.display.attributes.map(attr => (attr.visible ? reordered[cursor++] : attr));

            return {...view, display: {...view.display, attributes}};
        }
        case 'MOVE_SORT': {
            const {activeId, overId} = action.payload;

            if (activeId === overId) {
                return view;
            }

            // The sorts array order IS the order in which sorts are applied in the explorer.
            const from = view.sorts.findIndex(sort => getSortId(sort) === activeId);
            const to = view.sorts.findIndex(sort => getSortId(sort) === overId);

            if (from === -1 || to === -1 || from === to) {
                return view;
            }

            return {...view, sorts: arrayMove(view.sorts, from, to)};
        }
        case 'SET_SORT_ORDER': {
            const {id, order} = action.payload;
            const index = view.sorts.findIndex(sort => getSortId(sort) === id);

            if (index === -1 || view.sorts[index].order === order) {
                return view;
            }

            return {...view, sorts: view.sorts.toSpliced(index, 1, {...view.sorts[index], order})};
        }
        case 'TOGGLE_SORT_PINNED': {
            const {id} = action.payload;
            const index = view.sorts.findIndex(sort => getSortId(sort) === id);

            if (index === -1) {
                return view;
            }

            const target = view.sorts[index];

            if (target.pinned) {
                // Unpinning: flip the flag in place. The array position is irrelevant for unpinned
                // sorts since the unpinned list is re-sorted alphabetically by the selector.
                const sorts = view.sorts.toSpliced(index, 1, {...target, pinned: false});

                return {...view, sorts};
            }

            // Pinning: flip AND move just after the last pinned sort, so it appends to the end of
            // the pinned group (mirrors TOGGLE_VISIBILITY). The pinned order IS the sort priority.
            const withoutTarget = view.sorts.filter((_, i) => i !== index);
            const lastPinnedPos = withoutTarget.findLastIndex(sort => sort.pinned);
            const sorts = withoutTarget.toSpliced(lastPinnedPos + 1, 0, {...target, pinned: true});

            return {...view, sorts};
        }
        case 'TOGGLE_SHORTCUT': {
            const {shortcut} = action.payload;

            // The `display` shortcut is always pinned (the UI disables its pin button); guard
            // defensively so it can never be toggled off.
            if (shortcut === ViewV2Shortcut.display) {
                return view;
            }

            const isPinned = view.shortcuts.includes(shortcut);
            const shortcuts = isPinned
                ? view.shortcuts.filter(currentShortcut => currentShortcut !== shortcut)
                : [...view.shortcuts, shortcut];

            return {...view, shortcuts};
        }
        // Admin gear: the desired set of attributes available as columns. Reconcile against the
        // current list: keep still-selected columns as-is (preserving order AND visibility), append
        // newly-selected ones (hidden by default), drop deselected ones.
        case 'SET_AVAILABLE_COLUMNS': {
            const {attributes} = action.payload;
            const desiredIds = new Set(attributes.map(attribute => attribute.id));
            // The hard-coded identity column is never offered in the gear → never drop it here.
            const kept = view.display.attributes.filter(
                column => desiredIds.has(column.attribute.id) || column.attribute.id === IDENTITY_COLUMN_ID,
            );
            const keptIds = new Set(kept.map(column => column.attribute.id));
            const added = attributes
                .filter(attribute => !keptIds.has(attribute.id))
                .map(attribute => ({visible: false, attribute}));

            return {...view, display: {...view.display, attributes: [...kept, ...added]}};
        }
        // Admin gear: the desired set of attribute paths available as sorts. Reconcile against the
        // current list (keyed by `getSortId`): keep still-selected sorts as-is (preserving priority
        // order AND asc/desc), append newly-selected paths (ascending by default), drop deselected ones.
        case 'SET_AVAILABLE_SORTS': {
            const {sorts} = action.payload;
            const pathKey = (path: {attributes: (typeof sorts)[number]['attributes']}) =>
                path.attributes.map(attribute => attribute.id).join('/');
            const desiredKeys = new Set(sorts.map(pathKey));
            const kept = view.sorts.filter(sort => desiredKeys.has(getSortId(sort)));
            const keptKeys = new Set(kept.map(getSortId));
            const added = sorts
                .filter(path => !keptKeys.has(pathKey(path)))
                .map(path => ({attributes: path.attributes, order: SortOrder.asc, pinned: false}));

            return {...view, sorts: [...kept, ...added]};
        }
        // Mirror of MOVE_SORT for filters. The pinned filters array order IS the order in which the
        // filter chips appear in the ExplorerV2 FilterToolBar.
        case 'MOVE_FILTER': {
            const {activeId, overId} = action.payload;

            if (activeId === overId) {
                return view;
            }

            const from = view.filters.findIndex(filter => getFilterId(filter) === activeId);
            const to = view.filters.findIndex(filter => getFilterId(filter) === overId);

            if (from === -1 || to === -1 || from === to) {
                return view;
            }

            return {...view, filters: arrayMove(view.filters, from, to)};
        }
        // Mirror of TOGGLE_SORT_PINNED. Pinning moves the filter just after the last pinned one (its
        // toolbar position); unpinning flips the flag in place (the unpinned list is re-sorted alpha).
        case 'TOGGLE_FILTER_PINNED': {
            const {id} = action.payload;
            const index = view.filters.findIndex(filter => getFilterId(filter) === id);

            if (index === -1) {
                return view;
            }

            const target = view.filters[index];

            if (target.pinned) {
                const filters = view.filters.toSpliced(index, 1, {...target, pinned: false});
                return {...view, filters};
            }

            const withoutTarget = view.filters.filter((_, i) => i !== index);
            const lastPinnedPos = withoutTarget.findLastIndex(filter => filter.pinned);
            const filters = withoutTarget.toSpliced(lastPinnedPos + 1, 0, {...target, pinned: true});

            return {...view, filters};
        }
        // Edits the condition+value of a single filter (from the volet editor OR a write-back from the
        // FilterToolBar). Mirrors SET_SORT_ORDER: locate by `getFilterId`, splice the new config in place.
        case 'SET_FILTER_CONFIG': {
            const {id, condition, values} = action.payload;
            const index = view.filters.findIndex(filter => getFilterId(filter) === id);

            if (index === -1) {
                return view;
            }

            const current = view.filters[index];
            // G1 hardening: an idempotent write (same condition + values) must return the SAME view ref so
            // the wrapper's useReducer bail-out holds — otherwise `toSpliced` allocates a fresh array even
            // for a no-op write (unlike SET_SORT_ORDER, which already guards), and the hub↔spoke value sync
            // could loop. Mirror of the SET_SORT_ORDER equality guard.
            if (
                current.condition === condition &&
                current.values.length === values.length &&
                current.values.every((value, valueIndex) => value === values[valueIndex])
            ) {
                return view;
            }

            return {...view, filters: view.filters.toSpliced(index, 1, {...current, condition, values})};
        }
        // Admin gear: the desired set of attribute paths available as filters. Reconcile against the
        // current list (keyed by `getFilterId`): keep still-selected filters as-is (preserving order,
        // pinned, condition and values), append newly-selected paths (EQUAL/empty by default), drop
        // deselected ones. Mirror of SET_AVAILABLE_SORTS.
        case 'SET_AVAILABLE_FILTERS': {
            const {filters} = action.payload;
            const pathKey = (path: {attributes: (typeof filters)[number]['attributes']}) =>
                path.attributes.map(attribute => attribute.id).join('/');
            const desiredKeys = new Set(filters.map(pathKey));
            const kept = view.filters.filter(filter => desiredKeys.has(getFilterId(filter)));
            const keptKeys = new Set(kept.map(getFilterId));
            const added = filters
                .filter(path => !keptKeys.has(pathKey(path)))
                .map(path => ({
                    attributes: path.attributes,
                    condition: DEFAULT_FILTER_CONDITION,
                    values: [],
                    pinned: false,
                }));

            return {...view, filters: [...kept, ...added]};
        }
        default:
            return view;
    }
};

/**
 * Represents THE CURRENT VIEW being edited in the view-settings panel. Shared across every tab and
 * the CurrentViewSection header. Tracks a `savedView` snapshot alongside the live `view` so we can
 * detect unsaved modifications (`isDirty`) and revert them (RESET_VIEW).
 */
export const currentViewReducer = (state: ICurrentViewState, action: CurrentViewAction): ICurrentViewState => {
    switch (action.type) {
        // Seeds both snapshots: used on initial load and as the server echo after save/save-as.
        case 'LOAD_VIEW':
            return {view: action.payload, savedView: action.payload};
        // Seeds both snapshots with a fresh synthetic draft: identical snapshots → isDirty starts at
        // false; RESET_VIEW returns to the empty draft.
        case 'INIT_DEFAULT_VIEW': {
            const draft = createDefaultView(action.payload.library, action.payload.createdBy);
            return {view: draft, savedView: draft};
        }
        case 'RESET_VIEW':
            return {...state, view: state.savedView};
        case 'MARK_SAVED':
            return {...state, savedView: state.view};
        default:
            break;
    }

    if (!state.view) {
        return state;
    }

    switch (action.type) {
        case 'SET_LABEL': {
            const {lang, value} = action.payload;
            return {...state, view: {...state.view, label: {...(state.view.label ?? {}), [lang]: value}}};
        }
        // Sharing is persisted out-of-band (immediate mutation), so it must never read as "dirty"
        // and a reset must never re-alter it: write it symmetrically on both snapshots.
        case 'SET_SHARED':
            return {
                view: {...state.view, shared: action.payload.shared},
                savedView: state.savedView ? {...state.savedView, shared: action.payload.shared} : state.savedView,
            };
        default: {
            const nextView = viewReducer(state.view, action);
            // Preserve the state reference when the sub-reducer is a no-op (e.g. an idempotent
            // SYNC_FILTERS_FROM_EXPLORER whose values already match): returning a fresh `{...state}`
            // would defeat React's useReducer bail-out and, paired with ExplorerV2 re-emitting
            // onFiltersChange every render, loop indefinitely (Maximum update depth exceeded).
            return nextView === state.view ? state : {...state, view: nextView};
        }
    }
};

export {viewReducer};
