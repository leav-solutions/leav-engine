// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export type DisplayMode = 'table' | 'list' | 'timeline' | 'mosaic';

export const ViewSettingsActionTypes = {
    ADD_FIELD: 'ADD_FIELD',
    REMOVE_FIELD: 'REMOVE_FIELD',
    ORDER_FIELDS: 'ORDER_FIELDS',
    RESET_FIELDS: 'RESET_FIELDS',
    CHANGE_DISPLAY_MODE: 'CHANGE_DISPLAY_MODE'
} as const;

export interface IViewSettingsState {
    displayMode: DisplayMode;
    fields: string[];
}

interface IViewSettingsActionAddField {
    type: typeof ViewSettingsActionTypes.ADD_FIELD;
    payload: {field: string};
}

interface IViewSettingsActionRemoveField {
    type: typeof ViewSettingsActionTypes.REMOVE_FIELD;
    payload: {field: string};
}

interface IViewSettingsActionOrderFields {
    type: typeof ViewSettingsActionTypes.ORDER_FIELDS;
    payload: {fields: string[]};
}

interface IViewSettingsActionChangeDisplayMode {
    type: typeof ViewSettingsActionTypes.CHANGE_DISPLAY_MODE;
    payload: {displayMode: DisplayMode};
}

interface IViewSettingsActionResetField {
    type: typeof ViewSettingsActionTypes.RESET_FIELDS;
}

type Reducer<PAYLOAD = 'no_payload'> = PAYLOAD extends 'no_payload'
    ? (state: IViewSettingsState) => IViewSettingsState
    : (state: IViewSettingsState, payload: PAYLOAD) => IViewSettingsState;

const addField: Reducer<IViewSettingsActionAddField['payload']> = (state, payload) => ({
    ...state,
    fields: [...state.fields, payload.field]
});

const removeField: Reducer<IViewSettingsActionRemoveField['payload']> = (state, payload) => ({
    ...state,
    fields: state.fields.filter(field => field !== payload.field)
});

const orderFields: Reducer<IViewSettingsActionOrderFields['payload']> = (state, payload) => ({
    ...state,
    fields: payload.fields
});

const resetFields: Reducer = state => ({
    ...state,
    fields: []
});

const changeDisplayMode: Reducer<IViewSettingsActionChangeDisplayMode['payload']> = (state, payload) => ({
    ...state,
    displayMode: payload.displayMode
});

export type IViewSettingsAction =
    | IViewSettingsActionResetField
    | IViewSettingsActionAddField
    | IViewSettingsActionRemoveField
    | IViewSettingsActionOrderFields
    | IViewSettingsActionChangeDisplayMode;

const ViewSettingsReducer = (state: IViewSettingsState, action: IViewSettingsAction): IViewSettingsState => {
    switch (action.type) {
        case ViewSettingsActionTypes.ADD_FIELD: {
            return addField(state, action.payload);
        }
        case ViewSettingsActionTypes.REMOVE_FIELD: {
            return removeField(state, action.payload);
        }
        case ViewSettingsActionTypes.ORDER_FIELDS: {
            return orderFields(state, action.payload);
        }
        case ViewSettingsActionTypes.RESET_FIELDS: {
            return resetFields(state);
        }
        case ViewSettingsActionTypes.CHANGE_DISPLAY_MODE: {
            return changeDisplayMode(state, action.payload);
        }
        default:
            return state;
    }
};

export default ViewSettingsReducer;
