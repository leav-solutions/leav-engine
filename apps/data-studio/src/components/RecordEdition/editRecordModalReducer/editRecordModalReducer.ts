// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {RECORD_FORM_recordForm_elements_attribute} from '_gqlTypes/RECORD_FORM';
import {IValueVersion} from '_types/types';
import {StandardValueTypes} from '../EditRecord/_types';

export interface IRecordPropertyWithAttribute {
    attribute: RECORD_FORM_recordForm_elements_attribute;
    value: RecordProperty;
    editingValue?: StandardValueTypes;
}

export interface IEditRecordReducerState {
    record: RecordIdentity_whoAmI;
    libraryId: string;
    activeValue: IRecordPropertyWithAttribute;
    sidebarContent: 'summary' | 'valueDetails' | 'valuesVersions';
    valuesVersion: IValueVersion;
    originValuesVersion: IValueVersion;
    refreshRequested: boolean;
}

export enum EditRecordReducerActionsTypes {
    SET_RECORD = 'SET_RECORD',
    SET_ACTIVE_VALUE = 'SET_ACTIVE_VALUE',
    SET_SIDEBAR_CONTENT = 'SET_SIDEBAR_CONTENT',
    SET_VALUES_VERSION = 'SET_VALUES_VERSION',
    SET_EDITING_VALUE = 'SET_CURRENT_VALUE_CONTENT',
    REQUEST_REFRESH = 'REQUEST_REFRESH',
    REFRESH_DONE = 'REFRESH_DONE'
}

export type IEditRecordReducerActions =
    | {
          type: EditRecordReducerActionsTypes.SET_RECORD;
          record: IEditRecordReducerState['record'];
      }
    | {
          type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE;
          value: IEditRecordReducerState['activeValue'];
      }
    | {
          type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT;
          content: IEditRecordReducerState['sidebarContent'];
      }
    | {
          type: EditRecordReducerActionsTypes.SET_VALUES_VERSION;
          valuesVersion: IEditRecordReducerState['valuesVersion'];
      }
    | {
          type: EditRecordReducerActionsTypes.SET_EDITING_VALUE;
          value: StandardValueTypes;
      }
    | {
          type: EditRecordReducerActionsTypes.REQUEST_REFRESH;
      }
    | {
          type: EditRecordReducerActionsTypes.REFRESH_DONE;
      };

export type EditRecordDispatchFunc = (action: IEditRecordReducerActions) => void;

export const initialState: IEditRecordReducerState = {
    record: null,
    libraryId: null,
    activeValue: null,
    sidebarContent: 'summary',
    valuesVersion: null,
    originValuesVersion: null,
    refreshRequested: false
};

const editRecordModalReducer = (
    state: IEditRecordReducerState,
    action: IEditRecordReducerActions
): IEditRecordReducerState => {
    switch (action.type) {
        case EditRecordReducerActionsTypes.SET_RECORD:
            return {...state, record: action.record};
        case EditRecordReducerActionsTypes.SET_ACTIVE_VALUE:
            return {
                ...state,
                activeValue: action.value,
                sidebarContent: action.value !== null ? 'valueDetails' : 'summary'
            };
        case EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT:
            return {...state, sidebarContent: action.content};
        case EditRecordReducerActionsTypes.SET_VALUES_VERSION:
            return {...state, valuesVersion: action.valuesVersion};
        case EditRecordReducerActionsTypes.SET_EDITING_VALUE:
            return {
                ...state,
                activeValue: {
                    ...state.activeValue,
                    editingValue: action.value
                }
            };
        case EditRecordReducerActionsTypes.REQUEST_REFRESH:
            return {...state, refreshRequested: true};
        case EditRecordReducerActionsTypes.REFRESH_DONE:
            return {...state, refreshRequested: false};
        default:
            return state;
    }
};

export default editRecordModalReducer;
