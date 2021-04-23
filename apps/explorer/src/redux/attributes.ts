// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IAttribute} from '_types/types';
import {IAttributesState} from './stateType';

export const attributesInitialState: IAttributesState = {
    attributes: []
};

const attributesSlice = createSlice({
    name: 'attributes',
    initialState: attributesInitialState,
    reducers: {
        setAttributes: (state, action: PayloadAction<IAttribute[]>) => {
            state.attributes = action.payload;
        }
    }
});

export const {setAttributes} = attributesSlice.actions;

export default attributesSlice.reducer;
