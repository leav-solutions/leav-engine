// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive, IDateRangeValue, IKeyValue} from '@leav/utils';
import isCurrentVersion from '_ui/components/RecordEdition/EditRecordContent/helpers/isCurrentVersion';
import {
    VersionFieldScope,
    FormElement,
    ICommonFieldsReducerState,
    StandardValueTypes
} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {IRecordIdentityWhoAmI} from '_ui/types/records';
import {IValueVersion} from '_ui/types/values';
import {AttributeFormat, RecordFormAttributeFragment, ValueDetailsValueFragment} from '_ui/_gqlTypes';
import {IRecordPropertyStandard} from '_ui/_queries/records/getRecordPropertiesQuery';
import {arrayValueVersionToObject} from '_ui/_utils';

export type IdValue = string | null;
export const newValueId = '__new__';

export enum StandardFieldValueState {
    PRISTINE = 'PRISTINE',
    DIRTY = 'DIRTY'
}

export type StandardFieldReducerValues = IKeyValue<IStandardFieldValue>;

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

interface IInheritedNotOverride {
    isInheritedValue: true;
    isInheritedOverrideValue: false;
    isInheritedNotOverrideValue: true;
    inheritedValue: RecordFormElementsValueStandardValue;
}

interface IInheritedOverride {
    isInheritedValue: true;
    isInheritedOverrideValue: true;
    isInheritedNotOverrideValue: false;
    inheritedValue: RecordFormElementsValueStandardValue;
}

interface INotInherited {
    isInheritedValue: false;
    isInheritedOverrideValue: false;
    isInheritedNotOverrideValue: false;
    inheritedValue: null;
}

export type InheritedFlags = INotInherited | IInheritedOverride | IInheritedNotOverride;

interface ICalculatedNotOverride {
    isCalculatedValue: true;
    isCalculatedOverrideValue: false;
    isCalculatedNotOverrideValue: true;
    calculatedValue: RecordFormElementsValueStandardValue;
}

interface ICalculatedOverride {
    isCalculatedValue: true;
    isCalculatedOverrideValue: true;
    isCalculatedNotOverrideValue: false;
    calculatedValue: RecordFormElementsValueStandardValue;
}

interface INotCalculated {
    isCalculatedValue: false;
    isCalculatedOverrideValue: false;
    isCalculatedNotOverrideValue: false;
    calculatedValue: null;
}

export type CalculatedFlags = INotCalculated | ICalculatedOverride | ICalculatedNotOverride;

export type IStandardFieldReducerState = ICommonFieldsReducerState<StandardFieldReducerValues> & {
    metadataEdit: boolean;
} & InheritedFlags &
    CalculatedFlags;

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
    CANCEL_EDITING = 'CANCEL_EDITING',
    CHANGE_VERSION_SCOPE = 'CHANGE_VERSION_SCOPE',
    REFRESH_VALUES = 'REFRESH_VALUES'
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

export type StandardFieldReducerValueActions =
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
          newValue: ValueDetailsValueFragment;
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

export type StandardFieldReducerFieldActions =
    | {
          type: StandardFieldReducerActionsTypes.CHANGE_VERSION_SCOPE;
          scope: VersionFieldScope;
      }
    | {
          type: StandardFieldReducerActionsTypes.REFRESH_VALUES;
          values: RecordFormElementsValueStandardValue[];
          formVersion: IValueVersion;
      };

export type StandardFieldReducerAction = StandardFieldReducerValueActions | StandardFieldReducerFieldActions;

export type StandardFieldDispatchFunc = (action: StandardFieldReducerAction) => void;

const _updateValueData = (
    action: StandardFieldReducerValueActions,
    state: IStandardFieldReducerState,
    newValueData: Partial<IStandardFieldValue>
): IStandardFieldReducerState => {
    if (
        typeof action?.idValue === 'undefined' ||
        typeof state?.values?.[state.activeScope]?.values?.[action.idValue] === 'undefined'
    ) {
        return state;
    }

    const res = {
        ...state,
        values: {
            ...state.values,
            [state.activeScope]: {
                ...state.values[state.activeScope],
                values: {
                    ...state.values[state.activeScope]?.values,
                    [action.idValue]: {
                        ...state.values[state.activeScope].values[action.idValue],
                        ...newValueData
                    }
                }
            }
        }
    };

    return res;
};

const getInheritedValue = (values: RecordFormElementsValueStandardValue[]) => values.filter(value => value.isInherited);
const getNotInheritedOrOverrideValue = (values: RecordFormElementsValueStandardValue[]) =>
    values.filter(value => !value.isInherited && value.raw_value !== null);

/**
 * For given list of values, determine if there is inherited values, inherited/current version and default active scope
 */
const _computeScopeAndValues = (params: {
    attribute: RecordFormAttributeFragment;
    values: RecordFormElementsValueStandardValue[];
    formVersion: IValueVersion;
}): Pick<IStandardFieldReducerState, 'values' | 'activeScope'> => {
    const {attribute, values, formVersion} = params;

    // Get override or inhertied values
    let valuesToHandle = getNotInheritedOrOverrideValue(values);
    if (!valuesToHandle.length) {
        valuesToHandle = getInheritedValue(values);
    }

    const preparedValues = valuesToHandle.length
        ? valuesToHandle.reduce(
              (allValues: IKeyValue<IStandardFieldValue>, fieldValue, index) => ({
                  ...allValues,
                  [fieldValue?.id_value ?? null]: {
                      ...virginValue,
                      idValue: fieldValue?.id_value ?? null,
                      index,
                      value: fieldValue ?? null,
                      displayValue: fieldValue?.value ?? '',
                      editingValue: attribute.format === AttributeFormat.encrypted ? '' : (fieldValue?.raw_value ?? ''),
                      originRawValue:
                          attribute.format === AttributeFormat.encrypted ? '' : (fieldValue?.raw_value ?? '')
                  }
              }),
              {}
          )
        : {
              [newValueId]: {
                  ...virginValue,
                  idValue: newValueId
              }
          };

    const currentVersion: IValueVersion = attribute?.versions_conf?.versionable
        ? attribute.versions_conf.profile.trees.reduce((relevantVersion, tree) => {
              if (formVersion?.[tree.id]) {
                  relevantVersion[tree.id] = formVersion[tree.id];
              }

              return relevantVersion;
          }, {})
        : null;

    const hasVersionInheritedValues = attribute?.versions_conf?.versionable
        ? !isCurrentVersion(currentVersion, values?.[0]?.version ?? currentVersion)
        : false; // We assume that all values have the same version
    const inheritedVersion = hasVersionInheritedValues ? values?.[0]?.version : null;

    return {
        activeScope: hasVersionInheritedValues ? VersionFieldScope.INHERITED : VersionFieldScope.CURRENT,
        values: {
            [VersionFieldScope.CURRENT]: {
                version: currentVersion ?? null,
                values: hasVersionInheritedValues
                    ? {[newValueId]: {...virginValue, idValue: newValueId}}
                    : preparedValues
            },
            [VersionFieldScope.INHERITED]: hasVersionInheritedValues
                ? {version: inheritedVersion ?? null, values: preparedValues}
                : null
        }
    };
};

const _computeInheritedFlags = (fieldValues: RecordFormElementsValueStandardValue[]): InheritedFlags => {
    const inheritedValue = fieldValues.find(fieldValue => fieldValue.isInherited);
    const overrideValue = fieldValues.find(fieldValue => !fieldValue.isInherited && !fieldValue.isCalculated);

    if (inheritedValue === undefined) {
        return {
            inheritedValue: null,
            isInheritedValue: false,
            isInheritedOverrideValue: false,
            isInheritedNotOverrideValue: false
        };
    }

    const isInheritedValue = true;

    if (overrideValue.value === null) {
        return {
            inheritedValue,
            isInheritedValue,
            isInheritedNotOverrideValue: true,
            isInheritedOverrideValue: false
        };
    }

    return {
        inheritedValue,
        isInheritedValue,
        isInheritedNotOverrideValue: false,
        isInheritedOverrideValue: true
    };
};

const _computeCalculatedFlags = (fieldValues: RecordFormElementsValueStandardValue[]): CalculatedFlags => {
    const calculatedValue = fieldValues.find(fieldValue => fieldValue.isCalculated);
    const overrideValue = fieldValues.find(fieldValue => !fieldValue.isCalculated && !fieldValue.isInherited);

    if (calculatedValue === undefined) {
        return {
            calculatedValue: null,
            isCalculatedValue: false,
            isCalculatedOverrideValue: false,
            isCalculatedNotOverrideValue: false
        };
    }

    const isCalculatedValue = true;

    if (overrideValue.value === null) {
        return {
            calculatedValue,
            isCalculatedValue,
            isCalculatedNotOverrideValue: true,
            isCalculatedOverrideValue: false
        };
    }

    return {
        calculatedValue,
        isCalculatedValue,
        isCalculatedNotOverrideValue: false,
        isCalculatedOverrideValue: true
    };
};

export const computeInitialState = (params: {
    element: FormElement<unknown>;
    record: IRecordIdentityWhoAmI;
    isRecordReadOnly: boolean;
    metadataEdit: boolean;
    formVersion: IValueVersion;
}): IStandardFieldReducerState => {
    const {element, record, metadataEdit, isRecordReadOnly, formVersion} = params;
    const attribute = element.attribute;

    const fieldValues = [...(element.values as RecordFormElementsValueStandardValue[])];

    return {
        attribute,
        record,
        formElement: {...element},
        isReadOnly: attribute?.readonly || isRecordReadOnly || !attribute?.permissions?.edit_value,
        metadataEdit,
        ..._computeScopeAndValues({attribute, values: fieldValues, formVersion}),
        ..._computeInheritedFlags(fieldValues),
        ..._computeCalculatedFlags(fieldValues)
    };
};

// TODO: mettre à jour les tests
const standardFieldReducer = (
    state: IStandardFieldReducerState,
    action: StandardFieldReducerAction
): IStandardFieldReducerState => {
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
                    [state.activeScope]: {
                        ...state.values[state.activeScope],
                        values: {
                            ...state.values[state.activeScope].values,
                            [action.idValue ?? newValueId]: {
                                ...virginValue,
                                idValue: action.idValue ?? newValueId,
                                index: Object.keys(state.values).length,
                                isEditing: true
                            }
                        }
                    }
                }
            };
        case StandardFieldReducerActionsTypes.CHANGE_VALUE:
            return _updateValueData(action, state, {
                editingValue: action.value,
                state: StandardFieldValueState.DIRTY
            });
        case StandardFieldReducerActionsTypes.FOCUS_FIELD:
            return _updateValueData(action, state, {
                isEditing: true
            });
        case StandardFieldReducerActionsTypes.SET_ERROR:
            return _updateValueData(action, state, {
                error: action.error,
                isErrorDisplayed: true,
                state: StandardFieldValueState.DIRTY
            });
        case StandardFieldReducerActionsTypes.CLEAR_ERROR:
            return _updateValueData(action, state, {
                error: '',
                isErrorDisplayed: false
            });
        case StandardFieldReducerActionsTypes.SET_ERROR_DISPLAY:
            return _updateValueData(action, state, {
                isErrorDisplayed: action.displayError
            });
        case StandardFieldReducerActionsTypes.UNEDIT_FIELD:
            return _updateValueData(action, state, {
                isEditing: false,
                isErrorDisplayed: false,
                error: '',
                state: StandardFieldValueState.PRISTINE
            });
        case StandardFieldReducerActionsTypes.UPDATE_AFTER_SUBMIT: {
            const newRawValue =
                state.attribute.format !== AttributeFormat.encrypted
                    ? (action.newValue as ValueDetailsValueFragment).raw_value
                    : state.values[state.activeScope].values?.[action.idValue]?.editingValue;

            const newValueVersion = action.newValue.version ? arrayValueVersionToObject(action.newValue.version) : null;
            const newValueData = {
                ...virginValue,
                idValue: action.newValue.id_value,
                value: {
                    ...(action.newValue as ValueDetailsValueFragment),
                    version: newValueVersion
                } as unknown as IRecordPropertyStandard,
                displayValue: (action.newValue as ValueDetailsValueFragment).value,
                editingValue: newRawValue,
                originRawValue: newRawValue,
                version: newValueVersion
            };

            if (action.idValue !== newValueId) {
                return _updateValueData(
                    action,
                    {
                        ...state,
                        isInheritedOverrideValue: state.isInheritedValue ? true : state.isInheritedOverrideValue,
                        isInheritedNotOverrideValue: state.isInheritedValue ? false : state.isInheritedNotOverrideValue //TODO: Faire pareil pour Calculated
                    } as IStandardFieldReducerState,
                    newValueData
                );
            }

            const newState = {
                ...state
            };
            newState.isInheritedOverrideValue = state.isInheritedValue ? true : state.isInheritedOverrideValue;
            newState.isInheritedNotOverrideValue = state.isInheritedValue ? false : state.isInheritedNotOverrideValue; //TODO: Faire pareil pour Calculated

            const newStateActiveValues = newState.values[newState.activeScope].values;

            // Delete new value placeholder, replace it with actual new value with proper ID
            const newValIndex = newStateActiveValues[newValueId]?.index;
            delete newStateActiveValues[newValueId];

            newStateActiveValues[action.newValue.id_value] = {
                ...newValueData,
                index: newValIndex ?? Object.keys(newState.values).length
            };

            return newState;
        }
        case StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE: {
            const newState = {
                ...state,
                isInheritedOverrideValue: state.isInheritedValue ? false : state.isInheritedOverrideValue,
                isInheritedNotOverrideValue: state.isInheritedValue ? true : state.isInheritedNotOverrideValue //TODO: Faire pareil pour Calculated
            };
            const newStateActiveValues = newState.values[newState.activeScope].values;

            delete newStateActiveValues[action.idValue];

            if (action.allDeleted) {
                newState.values[newState.activeScope].values = _ensureOneValueIsPresent({});
                return newState as IStandardFieldReducerState;
            }

            newState.values[newState.activeScope].values = Object.values(
                _ensureOneValueIsPresent(newStateActiveValues)
            ).reduce(
                (values, value, index) => ({
                    ...values,
                    [value.idValue]: {
                        ...value,
                        index
                    }
                }),
                {}
            );
            return newState as IStandardFieldReducerState;
        }
        case StandardFieldReducerActionsTypes.CANCEL_EDITING: {
            if (action.idValue !== newValueId) {
                return _updateValueData(action, state, {
                    editingValue: state.values[state.activeScope].values[action.idValue].originRawValue,
                    isEditing: false,
                    state: StandardFieldValueState.PRISTINE
                });
            }

            const newState = {
                ...state,
                isInheritedOverrideValue: state.isInheritedValue ? false : state.isInheritedOverrideValue,
                isInheritedNotOverrideValue: state.isInheritedValue ? true : state.isInheritedNotOverrideValue //TODO: Faire pareil pour Calculated
            };

            delete newState.values[newState.activeScope].values[newValueId];

            newState.values[newState.activeScope].values = _ensureOneValueIsPresent(
                newState.values[newState.activeScope].values
            );

            return newState as IStandardFieldReducerState;
        }
        case StandardFieldReducerActionsTypes.CHANGE_VERSION_SCOPE: {
            return {
                ...state,
                activeScope: action.scope
            };
        }
        case StandardFieldReducerActionsTypes.REFRESH_VALUES: {
            const newScopeAndValues = _computeScopeAndValues({
                attribute: state.formElement.attribute,
                values: action.values,
                formVersion: action.formVersion
            });

            return {
                ...state,
                ...newScopeAndValues
            };
        }
        default:
            return state;
    }
};

export default standardFieldReducer;
