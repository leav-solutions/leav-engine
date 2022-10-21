// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import getActiveFieldValues from 'components/RecordEdition/EditRecord/helpers/getActiveFieldValues';
import isCurrentVersion from 'components/RecordEdition/EditRecord/helpers/isCurrentVersion';
import {FieldScope, FormElement, ICommonFieldsReducerState} from 'components/RecordEdition/EditRecord/_types';
import {
    RecordFormElementsValueLinkValue,
    RecordFormElementsValueTreeValue
} from 'hooks/useGetRecordForm/useGetRecordForm';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {RECORD_FORM_recordForm_elements_attribute} from '_gqlTypes/RECORD_FORM';
import {IValueVersion} from '_types/types';

type AllowedValuesType = RecordFormElementsValueLinkValue | RecordFormElementsValueTreeValue;

export interface ILinkFieldState<ValuesType> extends ICommonFieldsReducerState<ValuesType[]> {
    errorMessage: string | string[];
    isValuesAddVisible: boolean;
}

export enum LinkFieldReducerActionsType {
    ADD_VALUES = 'ADD_VALUES',
    DELETE_VALUE = 'DELETE_VALUE',
    DELETE_ALL_VALUES = 'DELETE_ALL_VALUES',
    SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE',
    CLEAR_ERROR_MESSAGE = 'CLEAR_ERROR_MESSAGE',
    SET_IS_VALUES_ADD_VISIBLE = 'SET_IS_VALUES_ADD_VISIBLE',
    CHANGE_ACTIVE_SCOPE = 'CHANGE_ACTIVE_SCOPE',
    REFRESH_VALUES = 'REFRESH_VALUES'
}

export type LinkFieldReducerActions<ValuesType extends AllowedValuesType> =
    | {
          type: LinkFieldReducerActionsType.ADD_VALUES;
          values: ValuesType[];
      }
    | {
          type: LinkFieldReducerActionsType.DELETE_VALUE;
          idValue: string;
      }
    | {
          type: LinkFieldReducerActionsType.DELETE_ALL_VALUES;
      }
    | {type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE; errorMessage: string | string[]}
    | {type: LinkFieldReducerActionsType.CLEAR_ERROR_MESSAGE}
    | {type: LinkFieldReducerActionsType.SET_IS_VALUES_ADD_VISIBLE; isValuesAddVisible: boolean}
    | {type: LinkFieldReducerActionsType.CHANGE_ACTIVE_SCOPE; scope: FieldScope}
    | {
          type: LinkFieldReducerActionsType.REFRESH_VALUES;
          values: ValuesType[];
          formVersion: IValueVersion;
      };

export const virginState: ILinkFieldState<AllowedValuesType> = {
    record: null,
    formElement: null,
    attribute: null,
    isReadOnly: false,
    activeScope: FieldScope.CURRENT,
    values: {
        [FieldScope.CURRENT]: {
            version: null,
            values: []
        },
        [FieldScope.INHERITED]: null
    },
    errorMessage: '',
    isValuesAddVisible: false
};

/**
 * For given list of values, determine if there is inherited values, inherited/current version and default active scope
 */
const _computeScopeAndValues = <ValuesType extends AllowedValuesType>(params: {
    attribute: RECORD_FORM_recordForm_elements_attribute;
    values: ValuesType[];
    formVersion: IValueVersion;
}): Pick<ILinkFieldState<ValuesType>, 'values' | 'activeScope'> => {
    const {attribute, values, formVersion} = params;

    const currentVersion: IValueVersion = attribute?.versions_conf?.versionable
        ? attribute.versions_conf.profile.trees.reduce((relevantVersion, tree) => {
              if (formVersion?.[tree.id]) {
                  relevantVersion[tree.id] = formVersion[tree.id];
              }

              return relevantVersion;
          }, {})
        : null;

    const hasInheritedValues = attribute?.versions_conf?.versionable
        ? !isCurrentVersion(currentVersion, values?.[0]?.version ?? currentVersion)
        : false; // We assume that all values have the same version
    const inheritedVersion = hasInheritedValues ? values?.[0]?.version : null;

    return {
        activeScope: hasInheritedValues ? FieldScope.INHERITED : FieldScope.CURRENT,
        values: {
            [FieldScope.CURRENT]: {
                version: currentVersion ?? null,
                values: hasInheritedValues ? [] : values
            },
            [FieldScope.INHERITED]: hasInheritedValues ? {version: inheritedVersion ?? null, values} : null
        }
    };
};

export const computeInitialState = <ValuesType extends AllowedValuesType>(params: {
    element: FormElement<unknown>;
    record: RecordIdentity_whoAmI;
    isRecordReadOnly: boolean;
    formVersion: IValueVersion;
}): ILinkFieldState<ValuesType> => {
    const {element, record, isRecordReadOnly, formVersion} = params;
    const attribute = element.attribute;

    const fieldValues = (element.values as ValuesType[]) ?? [];

    const initialState: ILinkFieldState<ValuesType> = {
        ...virginState,
        attribute,
        record,
        formElement: element,
        isReadOnly: attribute?.readonly || isRecordReadOnly || !attribute.permissions.edit_value,
        ..._computeScopeAndValues<ValuesType>({attribute, values: fieldValues, formVersion})
    };

    return initialState;
};

const linkFieldReducer = <ValuesType extends AllowedValuesType>(
    state: ILinkFieldState<ValuesType>,
    action: LinkFieldReducerActions<ValuesType>
): ILinkFieldState<ValuesType> => {
    switch (action.type) {
        case LinkFieldReducerActionsType.ADD_VALUES: {
            const newValues = [...state.values[state.activeScope].values, ...action.values];
            return {
                ...state,
                values: {
                    ...state.values,
                    [state.activeScope]: {
                        ...state.values[state.activeScope],
                        values: newValues
                    }
                }
            };
        }
        case LinkFieldReducerActionsType.DELETE_VALUE: {
            const activeValues = getActiveFieldValues(state);
            const newValues = activeValues.filter(value => value.id_value !== action.idValue);

            return {
                ...state,
                values: {
                    ...state.values,
                    [state.activeScope]: {
                        ...state.values[state.activeScope],
                        values: newValues
                    }
                }
            };
        }
        case LinkFieldReducerActionsType.DELETE_ALL_VALUES: {
            return {
                ...state,
                values: {
                    ...state.values,
                    [state.activeScope]: {
                        ...state.values[state.activeScope],
                        values: []
                    }
                }
            };
        }
        case LinkFieldReducerActionsType.SET_ERROR_MESSAGE: {
            return {...state, errorMessage: action.errorMessage};
        }
        case LinkFieldReducerActionsType.CLEAR_ERROR_MESSAGE: {
            return {...state, errorMessage: ''};
        }
        case LinkFieldReducerActionsType.SET_IS_VALUES_ADD_VISIBLE: {
            return {...state, isValuesAddVisible: action.isValuesAddVisible};
        }
        case LinkFieldReducerActionsType.CHANGE_ACTIVE_SCOPE: {
            return {...state, activeScope: action.scope};
        }
        case LinkFieldReducerActionsType.REFRESH_VALUES: {
            return {
                ...state,
                ..._computeScopeAndValues({
                    attribute: state.formElement.attribute,
                    values: action.values,
                    formVersion: state.values[FieldScope.CURRENT].version
                })
            };
        }
        default:
            return state;
    }
};

export default linkFieldReducer;
