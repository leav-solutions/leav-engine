// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import {cancelTaskMutation} from 'graphQL/mutations/tasks/cancelTask';
import {deleteTaskMutation} from 'graphQL/mutations/tasks/deleteTask';
import {BrowserRouter as Router} from 'react-router-dom';
import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';
import {TaskStatus, TaskType} from '_gqlTypes/globalTypes';
import {act, render, screen} from '_tests/testUtils';
import NotifsPanel from './NotifsPanel';

export const mockTask: GET_TASKS_tasks_list = {
    id: 'taskId',
    label: {fr: 'taskName', en: 'taskName'},
    archive: false,
    modified_at: Date.now(),
    created_at: Date.now(),
    startAt: Date.now(),
    progress: {description: null, percent: 0},
    status: TaskStatus.PENDING,
    role: {
        type: TaskType.INDEXATION,
        detail: null
    },
    priority: 1,
    created_by: null,
    startedAt: null,
    completedAt: null,
    link: null,
    canceledBy: null
};

describe('Notifs panel', () => {
    test('list', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: cancelTaskMutation
                }
            },
            {
                request: {
                    query: deleteTaskMutation
                },
                result: {
                    data: {
                        tasks: {
                            list: [{id: 'deletedTaskId'}]
                        }
                    }
                }
            }
        ];

        await act(async () => {
            render(
                <Router>
                    <NotifsPanel setNbNotifs={() => jest.fn()} />
                </Router>,
                {
                    apolloMocks: mocks,
                    storeState: {
                        tasks: {
                            tasks: {
                                Task1: {...mockTask, id: 'Task1', status: TaskStatus.DONE},
                                Task2: {...mockTask, id: 'Task2'}
                            }
                        },
                        notifications: {
                            isPanelOpen: true
                        }
                    }
                }
            );
        });

        expect(screen.getByText('notifications.title')).toBeInTheDocument();
        expect(screen.getAllByTestId('itemList').length).toBe(2);

        expect(screen.getByTestId('inProgressList')).toBeInTheDocument();
        expect(screen.getByTestId('completedList')).toBeInTheDocument();

        expect(screen.getByTestId('cancelBtn')).toBeInTheDocument();
        expect(screen.getByTestId('deleteBtn')).toBeInTheDocument();
    });
});
