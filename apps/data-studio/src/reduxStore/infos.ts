// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IBaseInfo, IInfo, InfoType} from '_types/types';
import {IInfosState} from './stateType';

export const infosInitialState: IInfosState = {
    stack: [],
    base: {
        content: '',
        type: InfoType.basic
    }
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
        }
    }
});

export const {setInfoBase, setInfoStack, addInfo} = infosSlice.actions;

export default infosSlice.reducer;
