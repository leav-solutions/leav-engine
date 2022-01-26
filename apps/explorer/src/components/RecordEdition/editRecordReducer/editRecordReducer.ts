// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {RECORD_FORM_recordForm_elements_attribute} from '_gqlTypes/RECORD_FORM';

export interface IRecordPropertyWithAttribute {
    attribute: RECORD_FORM_recordForm_elements_attribute;
    value: RecordProperty;
}

export interface IEditRecordReducerState {
    record: RecordIdentity_whoAmI;
    activeValue: IRecordPropertyWithAttribute;
    sidebarCollapsed: boolean;
}

export enum EditRecordReducerActionsTypes {
    TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
    SET_ACTIVE_VALUE = 'SET_ACTIVE_VALUE'
}

export type IEditRecordReducerActions =
    | {
          type: EditRecordReducerActionsTypes.TOGGLE_SIDEBAR;
      }
    | {
          type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE;
          value: IRecordPropertyWithAttribute;
      };

export type EditRecordDispatchFunc = (action: IEditRecordReducerActions) => void;

export const initialState: IEditRecordReducerState = {
    record: null,
    activeValue: null,
    sidebarCollapsed: true
};

const editRecordReducer = (
    state: IEditRecordReducerState,
    action: IEditRecordReducerActions
): IEditRecordReducerState => {
    switch (action.type) {
        case EditRecordReducerActionsTypes.TOGGLE_SIDEBAR:
            return {...state, sidebarCollapsed: !state.sidebarCollapsed};
        case EditRecordReducerActionsTypes.SET_ACTIVE_VALUE:
            return {...state, activeValue: action.value};
        default:
            return state;
    }
};

export default editRecordReducer;
