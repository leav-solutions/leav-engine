// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';

export interface ITasksState {
    tasks: {[taskId: string]: GET_TASKS_tasks_list};
}

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
        deleteTask: (state, action: PayloadAction<{id: string}>) => {
            const {[action.payload.id]: taskToDelete, ...restTasks} = state.tasks;
            state.tasks = restTasks;
        }
    }
});

export const {addTask, deleteTask} = tasksSlice.actions;

export default tasksSlice.reducer;
