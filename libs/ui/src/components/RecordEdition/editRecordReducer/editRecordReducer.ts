// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordIdentityWhoAmI} from '../../../types/records';
import {IValueVersion} from '../../../types/values';
import {RecordFormAttributeFragment, RecordUpdateSubscription, ValueDetailsFragment} from '../../../_gqlTypes';
import {RecordProperty} from '../../../_queries/records/getRecordPropertiesQuery';
import {StandardValueTypes} from '../EditRecordContent/_types';

export interface IRecordPropertyWithAttribute {
    attribute: RecordFormAttributeFragment;
    value: RecordProperty;
    editingValue?: StandardValueTypes;
}

export interface IEditRecordReducerState {
    record: IRecordIdentityWhoAmI;
    libraryId: string;
    activeValue: IRecordPropertyWithAttribute;
    sidebarContent: 'summary' | 'valueDetails' | 'valuesVersions' | 'none';
    sidebarDefaultHidden?: boolean;
    valuesVersion: IValueVersion;
    originValuesVersion: IValueVersion;
    refreshRequested: boolean;
    externalUpdate: {
        modifiers: IRecordIdentityWhoAmI[];
        updatedValues: {
            [attribute: string]: ValueDetailsFragment[];
        };
    };
}

export enum EditRecordReducerActionsTypes {
    SET_RECORD = 'SET_RECORD',
    SET_ACTIVE_VALUE = 'SET_ACTIVE_VALUE',
    SET_SIDEBAR_CONTENT = 'SET_SIDEBAR_CONTENT',
    SET_VALUES_VERSION = 'SET_VALUES_VERSION',
    SET_EDITING_VALUE = 'SET_CURRENT_VALUE_CONTENT',
    REQUEST_REFRESH = 'REQUEST_REFRESH',
    REFRESH_DONE = 'REFRESH_DONE',
    ADD_EXTERNAL_UPDATE = 'ADD_EXTERNAL_UPDATE',
    CLEAR_EXTERNAL_UPDATE = 'CLEAR_EXTERNAL_UPDATE'
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
      }
    | {
          type: EditRecordReducerActionsTypes.ADD_EXTERNAL_UPDATE;
          modifier: IRecordIdentityWhoAmI;
          updatedValues: RecordUpdateSubscription['recordUpdate']['updatedValues'];
      }
    | {
          type: EditRecordReducerActionsTypes.CLEAR_EXTERNAL_UPDATE;
      };

export type EditRecordDispatchFunc = (action: IEditRecordReducerActions) => void;

export const initialState: IEditRecordReducerState = {
    record: null,
    libraryId: null,
    activeValue: null,
    sidebarContent: 'summary',
    sidebarDefaultHidden: false,
    valuesVersion: null,
    originValuesVersion: null,
    refreshRequested: false,
    externalUpdate: {
        modifiers: [],
        updatedValues: {}
    }
};

const editRecordReducer = (
    state: IEditRecordReducerState,
    action: IEditRecordReducerActions
): IEditRecordReducerState => {
    switch (action.type) {
        case EditRecordReducerActionsTypes.SET_RECORD:
            return {...state, record: action.record};
        case EditRecordReducerActionsTypes.SET_ACTIVE_VALUE:
            const newSidebarContent =
                action.value !== null ? 'valueDetails' : state.sidebarDefaultHidden ? 'none' : 'summary';
            return {
                ...state,
                activeValue: action.value,
                sidebarContent: newSidebarContent
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
        case EditRecordReducerActionsTypes.ADD_EXTERNAL_UPDATE:
            const newState = {...state};
            const newModifiers = state.externalUpdate?.modifiers.find(m => m.id === action.modifier.id)
                ? newState.externalUpdate?.modifiers ?? []
                : [...(newState.externalUpdate?.modifiers ?? []), action.modifier];

            const newValues = action.updatedValues.reduce(
                (acc, updatedValue) => ({
                    ...acc,
                    [updatedValue.attribute]: [
                        ...(newState.externalUpdate?.[updatedValue.attribute] ?? []),
                        updatedValue.value
                    ]
                }),
                {}
            );

            newState.externalUpdate = {
                modifiers: newModifiers,
                updatedValues: {...(state.externalUpdate?.updatedValues ?? {}), ...newValues}
            };

            return newState;
        case EditRecordReducerActionsTypes.CLEAR_EXTERNAL_UPDATE:
            return {...state, externalUpdate: {...initialState.externalUpdate}};
        default:
            return state;
    }
};

export default editRecordReducer;
