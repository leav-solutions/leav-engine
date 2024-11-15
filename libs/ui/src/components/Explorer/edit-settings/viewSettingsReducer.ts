// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IViewSettingsState {
    displayMode: 'table' | 'list' | 'timeline' | 'mosaic';
    fields: string[];
}

export enum ViewSettingsActionTypes {
    CHANGE_DISPLAY_MODE = 'SET_DISPLAY_MODE',
    ADD_FIELD = 'ADD_FIELD',
    REMOVE_FIELD = 'REMOVE_FIELD',
    ORDER_FIELDS = 'ORDER_FIELDS',
    RESET_FIELDS = 'RESET_FIELDS'
}

export interface IViewSettingsActionAddField {
    type: ViewSettingsActionTypes.ADD_FIELD;
    field: string;
}

export interface IViewSettingsActionResetFields {
    type: ViewSettingsActionTypes.RESET_FIELDS;
}

export interface IViewSettingsActionRemoveField {
    type: ViewSettingsActionTypes.REMOVE_FIELD;
    field: string;
}

export interface IViewSettingsActionOrderFields {
    type: ViewSettingsActionTypes.ORDER_FIELDS;
    fields: string[];
}

export interface IViewSettingsActionChangeDisplayMode {
    type: ViewSettingsActionTypes.CHANGE_DISPLAY_MODE;
    displayMode: IViewSettingsState['displayMode'];
}

export type ViewSettingsAction =
    | IViewSettingsActionResetFields
    | IViewSettingsActionAddField
    | IViewSettingsActionRemoveField
    | IViewSettingsActionOrderFields
    | IViewSettingsActionChangeDisplayMode;

export type ViewSettingsDispatchFunc = (action: ViewSettingsAction) => void;

export interface IViewSettingsStateAndDispatch {
    state: IViewSettingsState;
    dispatch: ViewSettingsDispatchFunc;
}

const addField = (state: IViewSettingsState, action: IViewSettingsActionAddField) => ({
    ...state,
    fields: [...state.fields, action.field]
});

const removeField = (state: IViewSettingsState, action: IViewSettingsActionRemoveField) => ({
    ...state,
    fields: state.fields.filter(field => field !== action.field)
});

const orderFields = (state: IViewSettingsState, action: IViewSettingsActionOrderFields) => ({
    ...state,
    fields: action.fields
});

const resetFields = (state: IViewSettingsState) => ({
    ...state,
    fields: []
});

const changeDisplayMode = (state: IViewSettingsState, action: IViewSettingsActionChangeDisplayMode) => ({
    ...state,
    displayMode: action.displayMode
});

const ViewSettingsReducer = (state: IViewSettingsState, action: ViewSettingsAction): IViewSettingsState => {
    switch (action.type) {
        case ViewSettingsActionTypes.ADD_FIELD: {
            return addField(state, action);
        }
        case ViewSettingsActionTypes.REMOVE_FIELD: {
            return removeField(state, action);
        }
        case ViewSettingsActionTypes.ORDER_FIELDS: {
            return orderFields(state, action);
        }
        case ViewSettingsActionTypes.RESET_FIELDS: {
            return resetFields(state);
        }
        case ViewSettingsActionTypes.CHANGE_DISPLAY_MODE: {
            return changeDisplayMode(state, action);
        }
        default:
            return state;
    }
};

export default ViewSettingsReducer;
