import {IAccordionActive, IAttribute, IAttributesChecked} from './../../_types/types';

export enum ListAttributeReducerActionTypes {
    SET_ATTRS_CHECKED = 'SET_ATTRS_CHECKED',
    SET_LANG = 'SET_LANG',
    SET_CURRENT_ACCORDION = 'SET_CURRENT_ACCORDION',
    SET_NEW_ATTRIBUTES = 'SET_NEW_ATTRIBUTES',
    RESET = 'RESET'
}

export interface ListAttributeState {
    attributesChecked: IAttributesChecked[];
    lang: any;
    accordionsActive: IAccordionActive[];
    newAttributes: IAttribute[];

    attributeSelection?: string;
    changeSelected?: (attId: string) => void;
    useCheckbox?: boolean;
}

export const ListAttributeInitialState: ListAttributeState = {
    attributesChecked: [],
    lang: null,
    accordionsActive: [],
    newAttributes: []
};

export type ListAttributeReducerAction =
    | {
          type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED;
          attributesChecked: IAttributesChecked[];
      }
    | {
          type: ListAttributeReducerActionTypes.SET_LANG;
          lang: any;
      }
    | {
          type: ListAttributeReducerActionTypes.SET_CURRENT_ACCORDION;
          accordionsActive: IAccordionActive[];
      }
    | {
          type: ListAttributeReducerActionTypes.SET_NEW_ATTRIBUTES;
          newAttributes: IAttribute[];
      }
    | {
          type: ListAttributeReducerActionTypes.RESET;
      };

export const ListAttributeReducer = (
    state: ListAttributeState,
    action: ListAttributeReducerAction
): ListAttributeState => {
    switch (action.type) {
        case ListAttributeReducerActionTypes.SET_ATTRS_CHECKED:
            return {...state, attributesChecked: action.attributesChecked};
        case ListAttributeReducerActionTypes.SET_LANG:
            return {...state, lang: action.lang};
        case ListAttributeReducerActionTypes.SET_CURRENT_ACCORDION:
            return {...state, accordionsActive: action.accordionsActive};
        case ListAttributeReducerActionTypes.SET_NEW_ATTRIBUTES:
            return {...state, newAttributes: action.newAttributes};
        case ListAttributeReducerActionTypes.RESET:
            return ListAttributeInitialState;
        default:
            return state;
    }
};
