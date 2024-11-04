// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import reducer, {addTask, deleteTasks, tasksInitialState} from './tasks';
import {mockTask} from '../../__mocks__/task';

describe('tasks store', () => {
    test('Add task', async () => {
        const newState = reducer(tasksInitialState, addTask(mockTask));

        expect(newState.tasks).toMatchObject({[mockTask.id]: mockTask});
    });

    test('Delete task', async () => {
        const newState = reducer({tasks: {[mockTask.id]: mockTask}}, deleteTasks([mockTask]));

        expect(Object.keys(newState.tasks)).toHaveLength(0);
    });
});
