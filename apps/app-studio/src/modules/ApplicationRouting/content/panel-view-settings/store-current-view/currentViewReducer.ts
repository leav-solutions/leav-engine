import {arrayMove} from '@dnd-kit/sortable';
import {type CurrentViewAction, type CurrentView} from './_types';

export const initialCurrentViewState: CurrentView = null;

/**
 * Represents THE CURRENT VIEW being edited in the view-settings panel. Shared across every tab
 * and the CurrentViewSection header, so that we can later detect when the view has been modified but not saved,
 * and reset it when switching views.
 */
export const currentViewReducer = (state: CurrentView, action: CurrentViewAction): CurrentView => {
    if (action.type === 'LOAD_VIEW') {
        return action.payload;
    }
    if (!state) {
        return state;
    }

    switch (action.type) {
        case 'SET_VIEW_TYPE':
            return {...state, display: {...state.display, type: action.payload.viewType}};
        case 'TOGGLE_VISIBILITY': {
            const {id} = action.payload;
            const index = state.display.attributes.findIndex(attr => attr.attribute.id === id);

            if (index === -1) {
                return state;
            }

            const target = state.display.attributes[index];

            if (target.visible) {
                // Hiding: flip the flag in place. The array position is irrelevant for hidden
                // attributes since the invisible list is re-sorted alphabetically by the selector.
                const attributes = state.display.attributes.toSpliced(index, 1, {...target, visible: false});

                return {...state, display: {...state.display, attributes}};
            }

            // Showing: flip AND move just after the last visible attribute, so it appends to the
            // end of the visible group (mirrors the previous `[...visibleIds, id]` UX).
            const withoutTarget = state.display.attributes.filter((_, i) => i !== index);
            const lastVisiblePos = withoutTarget.findLastIndex(attr => attr.visible);
            const attributes = withoutTarget.toSpliced(lastVisiblePos + 1, 0, {...target, visible: true});

            return {...state, display: {...state.display, attributes}};
        }
        case 'MOVE_ATTRIBUTE': {
            const {activeId, overId} = action.payload;

            if (activeId === overId) {
                return state;
            }

            // Both ids are necessarily visible (the DnD only runs over the visible SortableContext).
            const visible = state.display.attributes.filter(attr => attr.visible);
            const from = visible.findIndex(attr => attr.attribute.id === activeId);
            const to = visible.findIndex(attr => attr.attribute.id === overId);

            if (from === -1 || to === -1 || from === to) {
                return state;
            }

            const reordered = arrayMove(visible, from, to);

            // Re-inject the reordered visible items into their (invariant) visible slots; hidden
            // attributes keep their positions.
            let cursor = 0;
            const attributes = state.display.attributes.map(attr => (attr.visible ? reordered[cursor++] : attr));

            return {...state, display: {...state.display, attributes}};
        }
        default:
            return state;
    }
};
