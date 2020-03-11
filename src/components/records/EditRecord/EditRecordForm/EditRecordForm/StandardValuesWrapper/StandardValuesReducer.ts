import {IValue} from '../../../../../../_types/records';

export enum StandardValuesActionTypes {
    REINIT = 'REINIT',
    ADD = 'ADD',
    CHANGE = 'CHANGE',
    SUBMIT = 'SUBMIT',
    DELETE = 'DELETE',
    CANCEL = 'CANCEL'
}

export type IStandardValuesActionData = {
    valueIndex?: number;
} & {
    [key: string]: any;
};

export interface IStandardValuesAction {
    type: StandardValuesActionTypes;
    data?: IStandardValuesActionData;
}

export interface IStandardValuesReducerState {
    values: IValue[];
    initialValues: IValue[];
}

const virginValue = {id_value: null, value: '', raw_value: '', modified_at: null, created_at: null, version: null};

const reducer = (state: IStandardValuesReducerState, action: IStandardValuesAction): IStandardValuesReducerState => {
    const valueIndex = action?.data?.valueIndex || 0;
    switch (action.type) {
        case StandardValuesActionTypes.REINIT: {
            const newState = {
                values: action?.data?.values || [],
                initialValues: action?.data?.values || []
            };
            return newState;
        }
        case StandardValuesActionTypes.ADD: {
            const newState = {
                ...state,
                values: [...state.values, {...virginValue}]
            };
            return newState;
        }
        case StandardValuesActionTypes.CHANGE: {
            const newState = {...state, values: [...state.values]};
            const newValue = {...newState.values[valueIndex], value: action?.data?.newValue || ''};
            newState.values[valueIndex] = newValue;
            return newState;
        }
        case StandardValuesActionTypes.SUBMIT: {
            const newState = {...state, initialValues: [...state.initialValues]};
            newState.initialValues[valueIndex] = state.values[valueIndex];
            return newState;
        }
        case StandardValuesActionTypes.DELETE: {
            const newState = {...state};
            newState.values = [...newState.values.slice(0, valueIndex), ...newState.values.slice(valueIndex + 1)];

            if (!newState.values.length) {
                newState.values.push({...virginValue});
            }

            return newState;
        }
        case StandardValuesActionTypes.CANCEL: {
            const newState = {...state, values: [...state.values]};
            newState.values[valueIndex] = state.initialValues[valueIndex];
            return newState;
        }
        default: {
            return state;
        }
    }
};

export default reducer;
