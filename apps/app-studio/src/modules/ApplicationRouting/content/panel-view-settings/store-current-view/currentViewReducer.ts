import {arrayMove} from '@dnd-kit/sortable';
import {ViewV2Shortcut} from '../../../../../__generated__';
import {type CurrentViewAction, type CurrentView, type ICurrentViewState, getSortId} from './_types';

export const initialCurrentViewState: ICurrentViewState = {view: null, savedView: null};

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
        // Seeds both snapshots: used on initial load and as the server echo after save/fork.
        case 'LOAD_VIEW':
            return {view: action.payload, savedView: action.payload};
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
        default:
            return {...state, view: viewReducer(state.view, action)};
    }
};

export {viewReducer};
