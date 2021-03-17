// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive} from '@leav/types/src';
import {IRecordProperty, IRecordPropertyAttribute} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {SAVE_VALUE_saveValue} from '_gqlTypes/SAVE_VALUE';

export interface IStandardFieldReducerState {
    attribute: IRecordPropertyAttribute;
    idValue: string | null;
    value: IRecordProperty | null;
    displayValue: AnyPrimitive;
    editingValue: AnyPrimitive;
    originRawValue: AnyPrimitive;
    isEditing: boolean;
    error?: string;
    isErrorDisplayed: boolean;
    isReadOnly: boolean;
}

export enum StandardFieldReducerActionsTypes {
    CHANGE_VALUE = 'CHANGE_VALUE',
    FOCUS_FIELD = 'FOCUS_FIELD',
    SET_ERROR = 'SET_ERROR',
    SET_ERROR_DISPLAY = 'SET_ERROR_DISPLAY',
    UNEDIT_FIELD = 'UNEDIT_FIELD',
    CLOSE_ERROR = 'CLOSE_ERROR',
    CLEAR_ERROR = 'CLEAR_ERROR',
    UPDATE_AFTER_SUBMIT = 'UPDATE_AFTER_SUBMIT',
    UPDATE_AFTER_DELETE = 'UPDATE_AFTER_DELETE',
    CANCEL_EDITING = 'CANCEL_EDITING'
}

export type StandardFieldReducerAction =
    | {
          type: StandardFieldReducerActionsTypes.CHANGE_VALUE;
          value: AnyPrimitive;
      }
    | {
          type: StandardFieldReducerActionsTypes.FOCUS_FIELD;
      }
    | {
          type: StandardFieldReducerActionsTypes.SET_ERROR;
          error: string;
      }
    | {
          type: StandardFieldReducerActionsTypes.UNEDIT_FIELD;
      }
    | {
          type: StandardFieldReducerActionsTypes.SET_ERROR_DISPLAY;
          displayError: boolean;
      }
    | {
          type: StandardFieldReducerActionsTypes.CLEAR_ERROR;
      }
    | {
          type: StandardFieldReducerActionsTypes.UPDATE_AFTER_SUBMIT;
          newValue: SAVE_VALUE_saveValue;
      }
    | {
          type: StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE;
      }
    | {
          type: StandardFieldReducerActionsTypes.CANCEL_EDITING;
      };

export type StandardFieldDispatchFunc = (action: StandardFieldReducerAction) => void;

const standardFieldReducer = (
    state: IStandardFieldReducerState,
    action: StandardFieldReducerAction
): IStandardFieldReducerState => {
    switch (action.type) {
        case StandardFieldReducerActionsTypes.CHANGE_VALUE:
            return {
                ...state,
                editingValue: action.value
            };
        case StandardFieldReducerActionsTypes.FOCUS_FIELD:
            return {
                ...state,
                isEditing: true
            };
        case StandardFieldReducerActionsTypes.SET_ERROR:
            return {
                ...state,
                error: action.error,
                isErrorDisplayed: true
            };
        case StandardFieldReducerActionsTypes.CLEAR_ERROR:
            return {
                ...state,
                error: '',
                isErrorDisplayed: false
            };
        case StandardFieldReducerActionsTypes.SET_ERROR_DISPLAY:
            return {
                ...state,
                isErrorDisplayed: action.displayError
            };
        case StandardFieldReducerActionsTypes.UNEDIT_FIELD:
            return {
                ...state,
                isEditing: false,
                isErrorDisplayed: false,
                error: ''
            };
        case StandardFieldReducerActionsTypes.UPDATE_AFTER_SUBMIT:
            const newRawValue =
                state.attribute.format !== AttributeFormat.encrypted ? action.newValue.raw_value : state.editingValue;

            return {
                ...state,
                value: action.newValue,
                displayValue: action.newValue.value,
                editingValue: newRawValue,
                originRawValue: newRawValue,
                idValue: action.newValue.id_value,
                error: '',
                isErrorDisplayed: false,
                isEditing: false
            };
        case StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE:
            return {
                ...state,
                value: null,
                displayValue: '',
                editingValue: '',
                originRawValue: '',
                idValue: null,
                error: '',
                isErrorDisplayed: false,
                isEditing: false
            };
        case StandardFieldReducerActionsTypes.CANCEL_EDITING:
            return {
                ...state,
                editingValue: state.originRawValue,
                isEditing: false
            };
        default:
            return state;
    }
};

export default standardFieldReducer;
