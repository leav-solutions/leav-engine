// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IField} from '_types/types';
import {IFieldsState} from './stateType';

export const fieldsInitialState: IFieldsState = {
    fields: []
};

const fieldsSlice = createSlice({
    name: 'fields',
    initialState: fieldsInitialState,
    reducers: {
        setFields: (state, action: PayloadAction<IField[]>) => {
            state.fields = action.payload;
        }
    }
});

export const {setFields} = fieldsSlice.actions;

export default fieldsSlice.reducer;
