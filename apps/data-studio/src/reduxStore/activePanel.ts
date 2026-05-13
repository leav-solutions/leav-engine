import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {WorkspacePanels} from '../_types/types';

const activePanelSlice = createSlice({
    name: 'activePanel',
    initialState: WorkspacePanels.HOME,
    reducers: {
        setActivePanel: (_, action: PayloadAction<WorkspacePanels>) => action.payload,
    },
});

export const {setActivePanel} = activePanelSlice.actions;

export default activePanelSlice.reducer;
