import {
    type GetViewV2Query,
    type RecordFilterCondition,
    type SortOrder,
    type ViewV2Shortcut,
} from '../../../../../__generated__';

export type CurrentView = GetViewV2Query['viewV2'] | null;

export type CurrentViewTypes = NonNullable<CurrentView>['display']['type'];

export type CurrentViewColumn = NonNullable<CurrentView>['display']['attributes'][number];

export type CurrentViewSort = NonNullable<CurrentView>['sorts'][number];

export type CurrentViewFilter = NonNullable<CurrentView>['filters'][number];

/**
 * A library attribute the admin gear can make "available" in a facet. Carries the label so the
 * reducer can build a full column/sort entry from the gear selection (the gear knows the labels,
 * the reducer doesn't fetch them). For a sort, `attributes` is the descent path (e.g. a link
 * attribute followed by one of its linked-library attributes).
 */
export type AvailableAttribute = CurrentViewColumn['attribute'];

/**
 * Stable id of a sort, derived from its attribute path. The DnD layer and the reducer must agree on
 * the same key to move a sort. Joining the attribute ids keeps the id stable even once link-attribute
 * descent (multiple attributes per sort) is supported.
 */
export const getSortId = (sort: CurrentViewSort): string => sort.attributes.map(attribute => attribute.id).join('/');

/**
 * Stable id of a filter, derived from its attribute path (mirror of {@link getSortId}). The DnD layer,
 * the reducer and the `UIFilter` bridge (TabFilters / toolbar sync) must all agree on this key to move,
 * pin or edit a filter. Joining the attribute ids keeps the id stable across link-attribute descent.
 */
export const getFilterId = (filter: CurrentViewFilter): string =>
    filter.attributes.map(attribute => attribute.id).join('/');

/**
 * The reducer tracks two snapshots of the view:
 * - `view`: the live, editable copy reflected by the UI.
 * - `savedView`: the last persisted state, used to compute `isDirty` and to power RESET_VIEW.
 */
export interface ICurrentViewState {
    view: CurrentView;
    savedView: CurrentView;
}

export type CurrentViewAction =
    | {type: 'LOAD_VIEW'; payload: NonNullable<CurrentView>}
    | {
          type: 'INIT_DEFAULT_VIEW';
          payload: {library: string; createdBy: {id: string; label: string}; origin?: string};
      }
    | {type: 'SET_LABEL'; payload: {lang: string; value: string}}
    | {type: 'SET_SHARED'; payload: {shared: boolean}}
    | {type: 'SET_VIEW_TYPE'; payload: {viewType: CurrentViewTypes}}
    | {type: 'SET_DISPLAY_SETTINGS'; payload: {settings: Record<string, unknown> | null}}
    | {type: 'TOGGLE_VISIBILITY'; payload: {id: string}}
    | {type: 'MOVE_ATTRIBUTE'; payload: {activeId: string; overId: string}}
    | {type: 'MOVE_SORT'; payload: {activeId: string; overId: string}}
    | {type: 'SET_SORT_ORDER'; payload: {id: string; order: SortOrder}}
    | {type: 'TOGGLE_SORT_PINNED'; payload: {id: string}}
    | {type: 'MOVE_FILTER'; payload: {activeId: string; overId: string}}
    | {type: 'TOGGLE_FILTER_PINNED'; payload: {id: string}}
    | {
          type: 'SET_FILTER_CONFIG';
          payload: {
              id: string;
              condition: RecordFilterCondition;
              values: Array<string | null>;
              withEmptyValues?: boolean;
          };
      }
    | {type: 'TOGGLE_SHORTCUT'; payload: {shortcut: ViewV2Shortcut}}
    | {type: 'SET_AVAILABLE_COLUMNS'; payload: {attributes: AvailableAttribute[]}}
    | {type: 'SET_AVAILABLE_SORTS'; payload: {sorts: Array<{attributes: AvailableAttribute[]}>}}
    | {type: 'SET_AVAILABLE_FILTERS'; payload: {filters: Array<{attributes: AvailableAttribute[]}>}}
    | {type: 'MARK_SAVED'}
    | {type: 'RESET_VIEW'};
