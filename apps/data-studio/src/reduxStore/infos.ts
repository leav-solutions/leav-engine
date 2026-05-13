import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {type IBaseInfo, type IInfo, InfoType} from '../_types/types';
import {type IInfosState} from './stateType';

export const infosInitialState: IInfosState = {
    stack: [],
    base: {
        content: '',
        type: InfoType.BASIC,
    },
};

const infosSlice = createSlice({
    name: 'infos',
    initialState: infosInitialState,
    reducers: {
        setInfoBase: (state, action: PayloadAction<IBaseInfo>) => {
            state.base = action.payload;
        },
        setInfoStack: (state, action: PayloadAction<IInfo[]>) => {
            state.stack = action.payload;
        },
        addInfo: (state, action: PayloadAction<IInfo>) => {
            state.stack = [...state.stack, action.payload];
        },
    },
});

export const {setInfoBase, setInfoStack, addInfo} = infosSlice.actions;

export default infosSlice.reducer;
