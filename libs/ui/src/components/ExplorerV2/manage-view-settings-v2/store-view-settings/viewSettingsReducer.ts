import {type SortOrder, type ViewV2Types} from '_ui/_gqlTypes';
import {type Entrypoint, type MassSelection, type ViewSettingsShortcuts} from '../../_types';

/**
 * ViewV2 display types (`cards` | `list` | `timeline`) are the only view types ExplorerV2 knows about.
 * The legacy `table`/`mosaic` mapping has been removed: ExplorerV2 consumes viewsV2 exclusively.
 */
export type ViewType = ViewV2Types;

export const ViewSettingsActionTypes = {
    RESET: 'RESET',
    CHANGE_PAGE_SIZE: 'CHANGE_PAGE_SIZE',
    CHANGE_FULLTEXT_SEARCH: 'CHANGE_FULLTEXT_SEARCH',
    CLEAR_FULLTEXT_SEARCH: 'CLEAR_FULLTEXT_SEARCH',
    SET_SELECTED_KEYS: 'SET_SELECTED_KEYS',
    CLEAR_MASS_SELECTION: 'CLEAR_MASS_SELECTION',
} as const;

/**
 * Computed view consumed across ExplorerV2.
 *
 * The reducer only owns the **ephemeral** fields (`fulltextSearch`, `pageSize`, `massSelection`)
 * plus the async-resolved `libraryId`/`entrypoint`. The **display** fields
 * (`viewId`, `viewLabels`, `viewType`, `attributesIds`, `sort`, `shortcuts`) come from the controlled
 * `currentView` prop and are merged on top in `Explorer.tsx` — they are kept in this type so the
 * existing consumers (actions, search, pagination…) keep reading `view.<field>` unchanged.
 */
export interface IViewSettingsState {
    libraryId: string;
    entrypoint: Entrypoint;
    viewId: string | null;
    viewLabels: Record<string, string>;
    viewType: ViewType;
    attributesIds: string[];
    /**
     * Id of the attribute designated as the grouping axis (kanban columns…). Display field: comes from
     * the controlled `currentView` and is merged on top in `Explorer.tsx` — no local mutating action.
     */
    groupByAttributeId?: string;
    fulltextSearch: string;
    sort: Array<{
        field: string;
        order: SortOrder;
    }>;
    shortcuts: ViewSettingsShortcuts[];
    pageSize: number;
    massSelection: MassSelection;
}

interface IViewSettingsActionChangePageSize {
    type: typeof ViewSettingsActionTypes.CHANGE_PAGE_SIZE;
    payload: {pageSize: number};
}

interface IViewSettingsActionChangeFulltextSearch {
    type: typeof ViewSettingsActionTypes.CHANGE_FULLTEXT_SEARCH;
    payload: {search: string};
}

interface IViewSettingsActionClearFulltextSearch {
    type: typeof ViewSettingsActionTypes.CLEAR_FULLTEXT_SEARCH;
}

interface IViewSettingsActionReset {
    type: typeof ViewSettingsActionTypes.RESET;
    payload: IViewSettingsState;
}

interface IViewSettingsActionSetSelectedKeys {
    type: typeof ViewSettingsActionTypes.SET_SELECTED_KEYS;
    payload: MassSelection;
}

/**
 * Distinct from SET_SELECTED_KEYS so every place that clears the selection once a mass action
 * completes can be found by searching for this specific type, instead of being indistinguishable
 * from manual selection changes (select all, toggle page, checkbox…).
 */
interface IViewSettingsActionClearMassSelection {
    type: typeof ViewSettingsActionTypes.CLEAR_MASS_SELECTION;
}

type Reducer<
    PAYLOAD extends {
        type: keyof typeof ViewSettingsActionTypes;
        payload?: unknown;
    } = {type: any; payload: 'no_payload'},
> = PAYLOAD['payload'] extends 'no_payload'
    ? (state: IViewSettingsState) => IViewSettingsState
    : (state: IViewSettingsState, payload: PAYLOAD['payload']) => IViewSettingsState;

const changePageSize: Reducer<IViewSettingsActionChangePageSize> = (state, payload) => ({
    ...state,
    pageSize: payload.pageSize,
});

const changeFulltextSearch: Reducer<IViewSettingsActionChangeFulltextSearch> = (state, payload) => ({
    ...state,
    fulltextSearch: payload.search,
});

export const clearFulltextSearch: Reducer = state => ({
    ...state,
    fulltextSearch: '',
});

const reset: Reducer<IViewSettingsActionReset> = (_, payload) => payload;

const setSelectedKeys: Reducer<IViewSettingsActionSetSelectedKeys> = (state, payload) => ({
    ...state,
    massSelection: payload,
});

const clearMassSelection: Reducer = state => setSelectedKeys(state, []);

export type IViewSettingsAction =
    | IViewSettingsActionChangePageSize
    | IViewSettingsActionChangeFulltextSearch
    | IViewSettingsActionClearFulltextSearch
    | IViewSettingsActionReset
    | IViewSettingsActionSetSelectedKeys
    | IViewSettingsActionClearMassSelection;

export const viewSettingsReducer = (state: IViewSettingsState, action: IViewSettingsAction): IViewSettingsState => {
    switch (action.type) {
        case ViewSettingsActionTypes.CHANGE_PAGE_SIZE: {
            return changePageSize(state, action.payload);
        }
        case ViewSettingsActionTypes.CHANGE_FULLTEXT_SEARCH: {
            return changeFulltextSearch(state, action.payload);
        }
        case ViewSettingsActionTypes.CLEAR_FULLTEXT_SEARCH: {
            return clearFulltextSearch(state);
        }
        case ViewSettingsActionTypes.RESET: {
            return reset(state, action.payload);
        }
        case ViewSettingsActionTypes.SET_SELECTED_KEYS: {
            return setSelectedKeys(state, action.payload);
        }
        case ViewSettingsActionTypes.CLEAR_MASS_SELECTION: {
            return clearMassSelection(state);
        }
        default:
            return state;
    }
};
