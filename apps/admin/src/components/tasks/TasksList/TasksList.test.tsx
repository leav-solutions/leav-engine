// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {Button} from 'semantic-ui-react';
import {act, render, screen} from '_tests/testUtils';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import {mockTask} from '../../../__mocks__/task';
import TasksList from './TasksList';

describe('TasksList', () => {
    const tasks = [
        {
            ...mockTask,
            id: 'test'
        },
        {
            ...mockTask,
            id: 'test2'
        },
        {
            ...mockTask,
            id: 'test3'
        }
    ];

    test('Render tasks list', async () => {
        await act(async () => {
            render(
                <MockedProvider>
                    <MockedUserContextProvider>
                        <TasksList
                            enabledColumns={[
                                'id',
                                'label',
                                'created_by',
                                'created_at',
                                'startAt',
                                'startedAt',
                                'canceledBy',
                                'completedAt',
                                'progress.percent',
                                'progress.description',
                                'duration'
                            ]}
                            tasks={tasks}
                        />
                    </MockedUserContextProvider>
                </MockedProvider>
            );
        });

        expect(screen.getByTestId('TasksList')).toBeInTheDocument();
        expect(screen.getAllByTestId('TableRow').length).toEqual(3);
    });

    test('Render tasks list with action/footer buttons', async () => {
        const mockBtn = (id: string) => <Button key={id} aria-label={id}></Button>;

        await act(async () => {
            render(
                <MockedProvider>
                    <MockedUserContextProvider>
                        <TasksList
                            enabledColumns={[
                                'id',
                                'label',
                                'created_by',
                                'created_at',
                                'startAt',
                                'startedAt',
                                'canceledBy',
                                'completedAt',
                                'progress.percent',
                                'progress.description',
                                'duration'
                            ]}
                            tasks={tasks}
                            actionsBtn={() => [mockBtn('mockActnBtn')]}
                            footerBtn={[mockBtn('mockFooterBtn')]}
                        />
                    </MockedUserContextProvider>
                </MockedProvider>
            );
        });

        expect(screen.getAllByRole('button', {name: 'mockActnBtn'})).toHaveLength(3);
        expect(screen.getAllByRole('button', {name: 'mockFooterBtn'})).toHaveLength(1);
    });
});
