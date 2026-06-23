import {type GetViewV2Query, type SortOrder} from '../../../../../__generated__';

export type CurrentView = GetViewV2Query['viewV2'] | null;

export type CurrentViewTypes = NonNullable<CurrentView>['display']['type'];

export type CurrentViewColumn = NonNullable<CurrentView>['display']['attributes'][number];

export type CurrentViewSort = NonNullable<CurrentView>['sorts'][number];

/**
 * Stable id of a sort, derived from its attribute path. The DnD layer and the reducer must agree on
 * the same key to move a sort. Joining the attribute ids keeps the id stable even once link-attribute
 * descent (multiple attributes per sort) is supported.
 */
export const getSortId = (sort: CurrentViewSort): string => sort.attributes.map(attribute => attribute.id).join('/');

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
    | {type: 'SET_LABEL'; payload: {lang: string; value: string}}
    | {type: 'SET_SHARED'; payload: {shared: boolean}}
    | {type: 'SET_VIEW_TYPE'; payload: {viewType: CurrentViewTypes}}
    | {type: 'TOGGLE_VISIBILITY'; payload: {id: string}}
    | {type: 'MOVE_ATTRIBUTE'; payload: {activeId: string; overId: string}}
    | {type: 'MOVE_SORT'; payload: {activeId: string; overId: string}}
    | {type: 'SET_SORT_ORDER'; payload: {id: string; order: SortOrder}}
    | {type: 'MARK_SAVED'}
    | {type: 'RESET_VIEW'};
