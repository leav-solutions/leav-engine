// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import reducer, {addTask, deleteTask, tasksInitialState} from './tasks';
import {mockTask} from '../../__mocks__/task';

describe('tasks store', () => {
    test('Add task', async () => {
        const newState = reducer(tasksInitialState, addTask(mockTask));

        expect(newState.tasks).toMatchObject({[mockTask.id]: mockTask});
    });

    test('Delete task', async () => {
        const newState = reducer({tasks: {[mockTask.id]: mockTask}}, deleteTask(mockTask));

        expect(Object.keys(newState.tasks)).toHaveLength(0);
    });
});
