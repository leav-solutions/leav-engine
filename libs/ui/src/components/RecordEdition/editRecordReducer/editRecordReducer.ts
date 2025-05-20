// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordIdentityWhoAmI} from '../../../types/records';
import {IValueVersion} from '../../../types/values';
import {RecordFormAttributeFragment, RecordUpdateSubscription, ValueDetailsFragment} from '../../../_gqlTypes';
import {
    RecordFormElementsValueLinkValue,
    RecordFormElementsValueStandardValue,
    RecordFormElementsValueTreeValue
} from '_ui/hooks/useGetRecordForm';
import {SystemTranslation} from '_ui/types';
import {TypeGuards} from '_ui/components/LibraryItemsList/LibraryItemsListTable/Cell/typeGuards';

export interface IRecordPropertyWithAttribute {
    attribute: RecordFormAttributeFragment;
    globalValues?: Array<RecordFormElementsValueStandardValue['payload']>;
    calculatedValue?: RecordFormElementsValueStandardValue['payload'];
}

export const EditRecordSidebarContentTypeMap = {
    SUMMARY: 'summary',
    VALUE_DETAILS: 'valueDetails',
    VALUES_VERSIONS: 'valuesVersions',
    NONE: 'none'
} as const;

export type EditRecordSidebarContentType =
    (typeof EditRecordSidebarContentTypeMap)[keyof typeof EditRecordSidebarContentTypeMap];

export interface IEditRecordReducerState {
    record: IRecordIdentityWhoAmI;
    libraryId: string;
    libraryLabel: SystemTranslation | null;
    activeAttribute: IRecordPropertyWithAttribute;
    sidebarContent: EditRecordSidebarContentType;
    enableSidebar: boolean;
    isOpenSidebar: boolean;
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
    withInfoButton: boolean;
}

export enum EditRecordReducerActionsTypes {
    SET_RECORD = 'SET_RECORD',
    SET_LIBRARY_LABEL = 'SET_LIBRARY_LABEL',
    SET_ACTIVE_VALUE = 'SET_ACTIVE_VALUE',
    INITIALIZE_SIDEBAR = 'INITIALIZE_SIDEBAR',
    SET_ENABLE_SIDEBAR = 'SET_ENABLE_SIDEBAR',
    SET_SIDEBAR_CONTENT = 'SET_SIDEBAR_CONTENT',
    SET_SIDEBAR_IS_OPEN = 'SET_SIDEBAR_IS_OPEN',
    SET_SIDEBAR_DEFAULT_HIDDEN = 'SET_SIDEBAR_DEFAULT_HIDDEN',
    SET_VALUES_VERSION = 'SET_VALUES_VERSION',
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
          type: EditRecordReducerActionsTypes.SET_LIBRARY_LABEL;
          label: SystemTranslation;
      }
    | {
          type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE;
          attribute?: IEditRecordReducerState['activeAttribute']['attribute'];
          values?:
              | RecordFormElementsValueStandardValue[]
              | RecordFormElementsValueLinkValue[]
              | RecordFormElementsValueTreeValue[];
      }
    | {
          type: EditRecordReducerActionsTypes.INITIALIZE_SIDEBAR;
          enabled: IEditRecordReducerState['enableSidebar'];
          isOpenByDefault: IEditRecordReducerState['sidebarDefaultHidden'];
      }
    | {
          type: EditRecordReducerActionsTypes.SET_ENABLE_SIDEBAR;
          enabled: IEditRecordReducerState['enableSidebar'];
      }
    | {
          type: EditRecordReducerActionsTypes.SET_SIDEBAR_IS_OPEN;
          isOpen: IEditRecordReducerState['isOpenSidebar'];
      }
    | {
          type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT;
          content: IEditRecordReducerState['sidebarContent'];
      }
    | {
          type: EditRecordReducerActionsTypes.SET_SIDEBAR_DEFAULT_HIDDEN;
          value: IEditRecordReducerState['sidebarDefaultHidden'];
      }
    | {
          type: EditRecordReducerActionsTypes.SET_VALUES_VERSION;
          valuesVersion: IEditRecordReducerState['valuesVersion'];
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
    libraryLabel: null,
    activeAttribute: null,
    enableSidebar: false,
    isOpenSidebar: false,
    sidebarContent: EditRecordSidebarContentTypeMap.NONE,
    sidebarDefaultHidden: false,
    valuesVersion: null,
    originValuesVersion: null,
    refreshRequested: false,
    externalUpdate: {
        modifiers: [],
        updatedValues: {}
    },
    withInfoButton: false
};

const editRecordReducer = (
    state: IEditRecordReducerState,
    action: IEditRecordReducerActions
): IEditRecordReducerState => {
    switch (action.type) {
        case EditRecordReducerActionsTypes.SET_RECORD:
            return {...state, record: action.record};
        case EditRecordReducerActionsTypes.SET_LIBRARY_LABEL:
            return {...state, libraryLabel: action.label};
        case EditRecordReducerActionsTypes.INITIALIZE_SIDEBAR: {
            const {enabled, isOpenByDefault} = action;
            // If the sidebar is not enabled, don't check for isOpenByDefault
            const isOpen = enabled && isOpenByDefault;
            return {
                ...state,
                enableSidebar: enabled,
                sidebarDefaultHidden: !isOpenByDefault,
                sidebarContent: isOpen ? EditRecordSidebarContentTypeMap.SUMMARY : EditRecordSidebarContentTypeMap.NONE,
                isOpenSidebar: isOpen
            };
        }
        case EditRecordReducerActionsTypes.SET_ENABLE_SIDEBAR:
            return {...state, enableSidebar: action.enabled};
        case EditRecordReducerActionsTypes.SET_SIDEBAR_DEFAULT_HIDDEN:
            return {...state, sidebarDefaultHidden: action.value};
        case EditRecordReducerActionsTypes.SET_ACTIVE_VALUE:
            const newSidebarContent =
                action.attribute !== null
                    ? EditRecordSidebarContentTypeMap.VALUE_DETAILS
                    : state.sidebarDefaultHidden
                      ? EditRecordSidebarContentTypeMap.NONE
                      : EditRecordSidebarContentTypeMap.SUMMARY;
            return {
                ...state,
                activeAttribute: {
                    attribute: action.attribute ?? state.activeAttribute?.attribute ?? null,
                    globalValues: action.values
                        ?.filter(value => !value.isCalculated && !value.isInherited)
                        .map(value => {
                            if (TypeGuards.isRecordFormElementsValuesLinkValue(value)) {
                                return value.linkValue.whoAmI.label ?? value.linkValue.whoAmI.id;
                            }

                            if (TypeGuards.isRecordFormElementsValuesTreeValue(value)) {
                                return value.treeValue.record.whoAmI.label ?? value.treeValue.record.whoAmI.id;
                            }

                            return value?.payload;
                        }),
                    calculatedValue: (() => {
                        const calculatedOrInheritedValue = action.values?.filter(
                            value => value.isCalculated || value.isInherited
                        )?.[0];

                        if (TypeGuards.isRecordFormElementsValuesLinkValue(calculatedOrInheritedValue)) {
                            return (
                                calculatedOrInheritedValue.linkValue.whoAmI.label ??
                                calculatedOrInheritedValue.linkValue.whoAmI.id
                            );
                        }

                        if (TypeGuards.isRecordFormElementsValuesTreeValue(calculatedOrInheritedValue)) {
                            return (
                                calculatedOrInheritedValue.treeValue.record.whoAmI.label ??
                                calculatedOrInheritedValue.treeValue.record.whoAmI.id
                            );
                        }

                        return calculatedOrInheritedValue?.payload;
                    })()
                },
                sidebarContent: newSidebarContent
            };
        case EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT:
            return {...state, sidebarContent: action.content};
        case EditRecordReducerActionsTypes.SET_SIDEBAR_IS_OPEN:
            return {
                ...state,
                sidebarContent: action.isOpen
                    ? EditRecordSidebarContentTypeMap.SUMMARY
                    : EditRecordSidebarContentTypeMap.NONE,
                isOpenSidebar: action.isOpen
            };
        case EditRecordReducerActionsTypes.SET_VALUES_VERSION:
            return {...state, valuesVersion: action.valuesVersion};
        case EditRecordReducerActionsTypes.REQUEST_REFRESH:
            return {...state, refreshRequested: true};
        case EditRecordReducerActionsTypes.REFRESH_DONE:
            return {...state, refreshRequested: false};
        case EditRecordReducerActionsTypes.ADD_EXTERNAL_UPDATE:
            const newState = {...state};
            const newModifiers = state.externalUpdate?.modifiers.find(m => m.id === action.modifier.id)
                ? (newState.externalUpdate?.modifiers ?? [])
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
            console.warn('Unknown action type in editRecordReducer:', action);
            return state;
    }
};

export default editRecordReducer;
