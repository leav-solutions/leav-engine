// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export type ViewType = 'table' | 'list' | 'timeline' | 'mosaic';

export const ViewSettingsActionTypes = {
    ADD_FIELD: 'ADD_FIELD',
    REMOVE_FIELD: 'REMOVE_FIELD',
    MOVE_FIELD: 'MOVE_FIELD',
    RESET_FIELDS: 'RESET_FIELDS',
    CHANGE_VIEW_TYPE: 'CHANGE_VIEW_TYPE'
} as const;

export interface IViewSettingsState {
    viewType: ViewType;
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

interface IViewSettingsActionMoveField {
    type: typeof ViewSettingsActionTypes.MOVE_FIELD;
    payload: {
        indexFrom: number;
        indexTo: number;
    };
}

interface IViewSettingsActionChangeViewType {
    type: typeof ViewSettingsActionTypes.CHANGE_VIEW_TYPE;
    payload: {viewType: ViewType};
}

interface IViewSettingsActionResetFields {
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

const moveField: Reducer<IViewSettingsActionMoveField['payload']> = (state, payload) => {
    const newFields = [...state.fields];
    const [fieldToMove] = newFields.splice(payload.indexFrom, 1);
    newFields.splice(payload.indexTo, 0, fieldToMove);
    return {
        ...state,
        fields: newFields
    };
};

const resetFields: Reducer = state => ({
    ...state,
    fields: []
});

const changeViewType: Reducer<IViewSettingsActionChangeViewType['payload']> = (state, payload) => ({
    ...state,
    viewType: payload.viewType
});

export type IViewSettingsAction =
    | IViewSettingsActionResetFields
    | IViewSettingsActionAddField
    | IViewSettingsActionRemoveField
    | IViewSettingsActionMoveField
    | IViewSettingsActionChangeViewType;

export const viewSettingsReducer = (state: IViewSettingsState, action: IViewSettingsAction): IViewSettingsState => {
    switch (action.type) {
        case ViewSettingsActionTypes.ADD_FIELD: {
            return addField(state, action.payload);
        }
        case ViewSettingsActionTypes.REMOVE_FIELD: {
            return removeField(state, action.payload);
        }
        case ViewSettingsActionTypes.MOVE_FIELD: {
            return moveField(state, action.payload);
        }
        case ViewSettingsActionTypes.RESET_FIELDS: {
            return resetFields(state);
        }
        case ViewSettingsActionTypes.CHANGE_VIEW_TYPE: {
            return changeViewType(state, action.payload);
        }
        default:
            return state;
    }
};
