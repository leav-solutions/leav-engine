// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export type DisplayMode = 'table' | 'list' | 'timeline' | 'mosaic';

export interface IViewSettingsState {
    displayMode: DisplayMode;
    fields: string[];
}

export enum ViewSettingsActionTypes {
    CHANGE_DISPLAY_MODE = 'SET_DISPLAY_MODE',
    ADD_FIELD = 'ADD_FIELD',
    REMOVE_FIELD = 'REMOVE_FIELD',
    RESET_FIELDS = 'RESET_FIELDS',
    MOVE_FIELD = 'MOVE_FIELD'
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

export interface IViewSettingsActionMoveField {
    type: ViewSettingsActionTypes.MOVE_FIELD;
    indexFrom: number;
    indexTo: number;
}

export interface IViewSettingsActionChangeDisplayMode {
    type: ViewSettingsActionTypes.CHANGE_DISPLAY_MODE;
    displayMode: DisplayMode;
}

export type ViewSettingsAction =
    | IViewSettingsActionResetFields
    | IViewSettingsActionAddField
    | IViewSettingsActionRemoveField
    | IViewSettingsActionMoveField
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

const moveField = (state: IViewSettingsState, {indexFrom, indexTo}: IViewSettingsActionMoveField) => {
    const newFields = [...state.fields];
    const [fieldToMove] = newFields.splice(indexFrom, 1);
    newFields.splice(indexTo, 0, fieldToMove);
    return {
        ...state,
        fields: newFields
    };
};

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
        case ViewSettingsActionTypes.MOVE_FIELD: {
            return moveField(state, action);
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
