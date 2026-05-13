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
