import {type GetViewV2Query} from '../../../../../__generated__';

export type CurrentView = GetViewV2Query['viewV2'] | null;

export type CurrentViewTypes = NonNullable<CurrentView>['display']['type'];

export type CurrentViewColumn = NonNullable<CurrentView>['display']['attributes'][number];

export type CurrentViewAction =
    | {type: 'LOAD_VIEW'; payload: NonNullable<CurrentView>}
    | {type: 'SET_VIEW_TYPE'; payload: {viewType: CurrentViewTypes}}
    | {type: 'TOGGLE_VISIBILITY'; payload: {id: string}}
    | {type: 'MOVE_ATTRIBUTE'; payload: {activeId: string; overId: string}};
