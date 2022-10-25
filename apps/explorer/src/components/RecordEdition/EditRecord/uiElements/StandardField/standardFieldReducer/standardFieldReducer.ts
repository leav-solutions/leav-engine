// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive, ICommonFieldsSettings, IKeyValue} from '@leav/utils';
import {FormElement, StandardValueTypes} from 'components/RecordEdition/EditRecord/_types';
import {IRecordPropertyAttribute, IRecordPropertyStandard} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {SAVE_VALUE_BATCH_saveValueBatch_values_Value} from '_gqlTypes/SAVE_VALUE_BATCH';
import {IDateRangeValue, IRecordIdentityWhoAmI} from '_types/types';

export type IdValue = string | null;
export const newValueId = '__new__';

export enum StandardFieldValueState {
    PRISTINE = 'PRISTINE',
    DIRTY = 'DIRTY'
}

export interface IStandardFieldValue {
    idValue: IdValue;
    index: number;
    value: IRecordPropertyStandard | null;
    displayValue: StandardValueTypes;
    editingValue: StandardValueTypes;
    originRawValue: StandardValueTypes;
    isEditing: boolean;
    error?: string;
    isErrorDisplayed: boolean;
    state: StandardFieldValueState;
}

export interface IStandardFieldReducerState {
    record: IRecordIdentityWhoAmI;
    formElement: FormElement<ICommonFieldsSettings>;
    attribute: IRecordPropertyAttribute;
    isReadOnly: boolean;
    values: IKeyValue<IStandardFieldValue>;
    metadataEdit: boolean;
}

export enum StandardFieldReducerActionsTypes {
    ADD_VALUE = 'ADD_VALUE',
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

export const virginValue: IStandardFieldValue = {
    idValue: null,
    index: 0,
    value: null,
    displayValue: '',
    editingValue: '',
    originRawValue: '',
    error: '',
    isErrorDisplayed: false,
    isEditing: false,
    state: StandardFieldValueState.PRISTINE
};

export type StandardFieldReducerAction =
    | {
          type: StandardFieldReducerActionsTypes.ADD_VALUE;
          idValue?: IdValue;
      }
    | {
          type: StandardFieldReducerActionsTypes.CHANGE_VALUE;
          idValue: IdValue;
          value: AnyPrimitive | IDateRangeValue;
      }
    | {
          type: StandardFieldReducerActionsTypes.FOCUS_FIELD;
          idValue: IdValue;
      }
    | {
          type: StandardFieldReducerActionsTypes.SET_ERROR;
          idValue: IdValue;
          error: string;
      }
    | {
          type: StandardFieldReducerActionsTypes.UNEDIT_FIELD;
          idValue: IdValue;
      }
    | {
          type: StandardFieldReducerActionsTypes.SET_ERROR_DISPLAY;
          idValue: IdValue;
          displayError: boolean;
      }
    | {
          type: StandardFieldReducerActionsTypes.CLEAR_ERROR;
          idValue: IdValue;
      }
    | {
          type: StandardFieldReducerActionsTypes.UPDATE_AFTER_SUBMIT;
          idValue: IdValue;
          newValue: SAVE_VALUE_BATCH_saveValueBatch_values_Value;
      }
    | {
          type: StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE;
          idValue?: IdValue;
          allDeleted?: boolean;
      }
    | {
          type: StandardFieldReducerActionsTypes.CANCEL_EDITING;
          idValue: IdValue;
      };

export type StandardFieldDispatchFunc = (action: StandardFieldReducerAction) => void;

const standardFieldReducer = (
    state: IStandardFieldReducerState,
    action: StandardFieldReducerAction
): IStandardFieldReducerState => {
    const _updateValueData = (newValueData: Partial<IStandardFieldValue>): IStandardFieldReducerState => {
        if (!state.values[action.idValue]) {
            return state;
        }

        const res = {
            ...state,
            values: {
                ...state.values,
                [action.idValue]: {
                    ...state.values[action.idValue],
                    ...newValueData
                }
            }
        };
        return res;
    };

    const _ensureOneValueIsPresent = (values: IKeyValue<IStandardFieldValue>): IKeyValue<IStandardFieldValue> => {
        if (Object.keys(values).length) {
            return values;
        }

        return {
            [newValueId]: {
                ...virginValue,
                idValue: newValueId
            }
        };
    };

    switch (action.type) {
        case StandardFieldReducerActionsTypes.ADD_VALUE:
            return {
                ...state,
                values: {
                    ...state.values,
                    [action.idValue ?? newValueId]: {
                        idValue: action.idValue ?? newValueId,
                        index: Object.keys(state.values).length,
                        value: null,
                        displayValue: '',
                        editingValue: '',
                        originRawValue: '',
                        isEditing: true,
                        isErrorDisplayed: false,
                        state: StandardFieldValueState.PRISTINE
                    }
                }
            };
        case StandardFieldReducerActionsTypes.CHANGE_VALUE:
            return _updateValueData({
                editingValue: action.value,
                state: StandardFieldValueState.DIRTY
            });
        case StandardFieldReducerActionsTypes.FOCUS_FIELD:
            return _updateValueData({
                isEditing: true
            });
        case StandardFieldReducerActionsTypes.SET_ERROR: {
            const newState = _updateValueData({
                error: action.error,
                isErrorDisplayed: true,
                state: StandardFieldValueState.DIRTY
            });
            return newState;
        }
        case StandardFieldReducerActionsTypes.CLEAR_ERROR:
            return _updateValueData({
                error: '',
                isErrorDisplayed: false
            });
        case StandardFieldReducerActionsTypes.SET_ERROR_DISPLAY:
            return _updateValueData({
                isErrorDisplayed: action.displayError
            });
        case StandardFieldReducerActionsTypes.UNEDIT_FIELD:
            return _updateValueData({
                isEditing: false,
                isErrorDisplayed: false,
                error: '',
                state: StandardFieldValueState.PRISTINE
            });
        case StandardFieldReducerActionsTypes.UPDATE_AFTER_SUBMIT: {
            const newRawValue =
                state.attribute.format !== AttributeFormat.encrypted
                    ? (action.newValue as SAVE_VALUE_BATCH_saveValueBatch_values_Value).raw_value
                    : state.values[action.idValue].editingValue;

            const newValueData = {
                idValue: action.newValue.id_value,
                value: action.newValue as SAVE_VALUE_BATCH_saveValueBatch_values_Value,
                displayValue: (action.newValue as SAVE_VALUE_BATCH_saveValueBatch_values_Value).value,
                editingValue: newRawValue,
                originRawValue: newRawValue,
                error: '',
                isErrorDisplayed: false,
                isEditing: false,
                state: StandardFieldValueState.PRISTINE
            };

            if (action.idValue !== newValueId) {
                return _updateValueData(newValueData);
            }

            const newState = {...state};

            // Delete new value placeholder, replace it with actual new value with proper ID
            const newValIndex = newState.values[newValueId]?.index;
            delete newState.values[newValueId];

            newState.values[action.newValue.id_value] = {
                ...newValueData,
                index: newValIndex ?? Object.keys(newState.values).length
            };

            return newState;
        }
        case StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE: {
            const newState = {...state};

            if (action.allDeleted) {
                newState.values = _ensureOneValueIsPresent({});
                return newState;
            }

            delete newState.values[action.idValue];

            newState.values = _ensureOneValueIsPresent(newState.values);
            // Restore index on all remaining values
            newState.values = Object.values(newState.values).reduce(
                (values, value, index) => ({
                    ...values,
                    [value.idValue]: {
                        ...value,
                        index
                    }
                }),
                {}
            );

            return newState;
        }
        case StandardFieldReducerActionsTypes.CANCEL_EDITING: {
            if (action.idValue !== newValueId) {
                return _updateValueData({
                    editingValue: state.values[action.idValue].originRawValue,
                    isEditing: false,
                    state: StandardFieldValueState.PRISTINE
                });
            }

            const newState = {...state};

            delete newState.values[newValueId];

            newState.values = _ensureOneValueIsPresent(newState.values);

            return newState;
        }

        default:
            return state;
    }
};

export default standardFieldReducer;
