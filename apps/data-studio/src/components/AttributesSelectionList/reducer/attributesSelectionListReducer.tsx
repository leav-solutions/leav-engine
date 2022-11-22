// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {reorder} from '../../../utils';
import {GET_ATTRIBUTES_BY_LIB_attributes_list} from '../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {ISelectedAttribute} from '../../../_types/types';

export interface IAttributesSelectionListState {
    library: string;
    multiple: boolean;
    canExpandExtendedAttributes: boolean;
    expandedAttributePath: string;
    attributes: GET_ATTRIBUTES_BY_LIB_attributes_list[];
    selectedAttributes: ISelectedAttribute[];
}

export enum AttributesSelectionListActionTypes {
    SET_ATTRIBUTES = 'SET_ATTRIBUTES',
    TOGGLE_ATTRIBUTE_SELECTION = 'TOGGLE_ATTRIBUTE_SELECTION',
    TOGGLE_ATTRIBUTE_EXPAND = 'TOGGLE_ATTRIBUTE_EXPAND',
    MOVE_SELECTED_ATTRIBUTE = 'MOVE_SELECTED_ATTRIBUTE'
}

export type AttributesSelectionListAction =
    | {
          type: AttributesSelectionListActionTypes.SET_ATTRIBUTES;
          attributes: GET_ATTRIBUTES_BY_LIB_attributes_list[];
      }
    | {
          type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_EXPAND;
          attributePath: string;
      }
    | {
          type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_SELECTION;
          attribute: ISelectedAttribute;
      }
    | {
          type: AttributesSelectionListActionTypes.MOVE_SELECTED_ATTRIBUTE;
          from: number;
          to: number;
      };

export const initialState: IAttributesSelectionListState = {
    library: '',
    multiple: true,
    canExpandExtendedAttributes: true,
    selectedAttributes: [],
    expandedAttributePath: '',
    attributes: []
};

const attributeSelectionListReducer = (
    state: IAttributesSelectionListState,
    action: AttributesSelectionListAction
): IAttributesSelectionListState => {
    switch (action.type) {
        case AttributesSelectionListActionTypes.SET_ATTRIBUTES: {
            return {...state, attributes: action.attributes};
        }
        case AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_EXPAND: {
            const newState = {...state};

            // If toggled attribute's path is in expanded attribute path, go back up to its parent.
            // Otherwise, expand given attribute path
            if (state.expandedAttributePath.indexOf(action.attributePath) === 0) {
                newState.expandedAttributePath = action.attributePath.split('.').slice(0, -1).join('.');
            } else {
                newState.expandedAttributePath = action.attributePath;
            }

            return newState;
        }
        case AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_SELECTION: {
            let newSelection = [...state.selectedAttributes];
            const existingIndex = state.selectedAttributes.findIndex(a => a.path === action.attribute.path);
            if (state.multiple) {
                if (existingIndex === -1) {
                    newSelection = [...newSelection, action.attribute];
                } else {
                    newSelection = [...newSelection.slice(0, existingIndex), ...newSelection.slice(existingIndex + 1)];
                }
            } else {
                newSelection = existingIndex === -1 ? [action.attribute] : [];
            }

            return {
                ...state,
                selectedAttributes: newSelection
            };
        }
        case AttributesSelectionListActionTypes.MOVE_SELECTED_ATTRIBUTE: {
            let newSelection = [...state.selectedAttributes];
            let {from, to} = action;

            if (!newSelection[from]) {
                return state;
            }

            if (to > newSelection.length - 1) {
                to = newSelection.length - 1;
            }

            if (from < 0) {
                from = 0;
            }

            newSelection = reorder(newSelection, from, to);

            return {
                ...state,
                selectedAttributes: newSelection
            };
        }
    }
};

export default attributeSelectionListReducer;
