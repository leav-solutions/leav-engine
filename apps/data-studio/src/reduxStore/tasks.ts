import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {type GET_TASKS_tasks_list} from '../_gqlTypes/GET_TASKS';
import {type ITasksState} from './stateType';

export const tasksInitialState: ITasksState = {
    tasks: {},
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
        },
    },
});

export const {addTask, deleteTasks} = tasksSlice.actions;

export default tasksSlice.reducer;
