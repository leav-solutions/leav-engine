// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import {History} from 'history';
import {getTasks} from 'queries/tasks/getTasks';
import {subTaskUpdates} from 'queries/tasks/subTaskUpdates';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {act, render, screen} from '_tests/testUtils';
import {mockTask} from '__mocks__/task';
import Tasks from './Tasks';

jest.mock('../TasksList', () => {
    return function TasksList() {
        return <div>TasksList</div>;
    };
});

const mockAppSelector = jest.fn();
const mockAppDispatch = jest.fn();

jest.mock('redux/store', () => ({
    useAppSelector: () => mockAppSelector,
    useAppDispatch: () => mockAppDispatch
}));

describe('Tasks', () => {
    test('Snapshot test', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: getTasks
                },
                result: {
                    data: {
                        tasks: {
                            list: [mockTask]
                        }
                    }
                }
            },
            {
                request: {
                    query: subTaskUpdates
                },
                result: {
                    data: {
                        tasks: {
                            list: [mockTask]
                        }
                    }
                }
            }
        ];

        await act(async () => {
            render(
                <Router>
                    <Tasks />
                </Router>,
                {apolloMocks: mocks, storeState: {tasks: {tasks: {}}}}
            );
        });

        expect(screen.getByText('TasksList')).toBeInTheDocument();
    });
});
