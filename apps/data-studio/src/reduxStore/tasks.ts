// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';
import {ITasksState} from './stateType';

export const tasksInitialState: ITasksState = {
    tasks: {}
};

const tasksSlice = createSlice({
    name: 'tasks',
    initialState: tasksInitialState,
    reducers: {
        addTask: (state, action: PayloadAction<GET_TASKS_tasks_list>) => {
            state.tasks[action.payload.id] = action.payload;
        },
        deleteTasks: (state, action: PayloadAction<Array<{id: string}>>) => {
            const toExclude = action.payload.map(e => e.id);
            state.tasks = Object.fromEntries(Object.entries(state.tasks).filter(t => !toExclude.includes(t[0])));
        }
    }
});

export const {addTask, deleteTasks} = tasksSlice.actions;

export default tasksSlice.reducer;
