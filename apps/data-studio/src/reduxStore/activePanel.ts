// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {WorkspacePanels} from '_types/types';

const activePanelSlice = createSlice({
    name: 'activePanel',
    initialState: WorkspacePanels.HOME,
    reducers: {
        setActivePanel: (_, action: PayloadAction<WorkspacePanels>) => action.payload
    }
});

export const {setActivePanel} = activePanelSlice.actions;

export default activePanelSlice.reducer;
