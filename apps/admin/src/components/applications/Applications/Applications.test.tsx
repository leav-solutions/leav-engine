// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {deleteApplicationQuery} from 'queries/applications/deleteApplicationMutation';
import {getApplicationsQuery} from 'queries/applications/getApplicationsQuery';
import {act, render, screen} from '_tests/testUtils';
import {mockApplication} from '__mocks__/common/applications';
import Applications from './Applications';

const mockHistoryPush = jest.fn();
jest.mock('react-router-v5', () => ({
    ...jest.requireActual('react-router-v5'),
    useHistory: () => ({
        push: mockHistoryPush
    })
}));

describe('Applications', () => {
    test('Display list of applications, filter and edit', async () => {
        const mocks = [
            {
                request: {
                    query: getApplicationsQuery,
                    variables: {filters: {}}
                },
                result: {
                    data: {
                        applications: {
                            list: [
                                {...mockApplication, id: 'appA'},
                                {...mockApplication, id: 'appB'}
                            ]
                        }
                    }
                }
            },
            {
                request: {
                    query: getApplicationsQuery,
                    variables: {filters: {id: '%B%'}}
                },
                result: {
                    data: {
                        applications: {
                            list: [{...mockApplication, id: 'appB'}]
                        }
                    }
                }
            }
        ];

        render(<Applications />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();
        expect(await screen.findByText('appA')).toBeInTheDocument();
        expect(await screen.findByText('appB')).toBeInTheDocument();

        // Filter list
        userEvent.type(screen.getByRole('textbox', {name: /id/}), 'B');
        expect(screen.getByText(/loading/)).toBeInTheDocument();
        expect(await screen.findByText('appB')).toBeInTheDocument();
        expect(screen.queryByText('appA')).not.toBeInTheDocument();

        userEvent.click(screen.getByText('appB'));
        expect(mockHistoryPush).toHaveBeenCalledWith('/applications/edit/appB');
    });

    test('Can delete an application', async () => {
        let deleteCalled = false;
        const mocks = [
            {
                request: {
                    query: getApplicationsQuery,
                    variables: {filters: {}}
                },
                result: {
                    data: {
                        applications: {
                            list: [
                                {...mockApplication, id: 'appA'},
                                {...mockApplication, id: 'appB'}
                            ]
                        }
                    }
                }
            },
            {
                request: {
                    query: deleteApplicationQuery,
                    variables: {appId: 'appA'}
                },
                result: () => {
                    deleteCalled = true;
                    return {
                        data: {
                            deleteApplication: {
                                id: 'appA '
                            }
                        }
                    };
                }
            }
        ];

        render(<Applications />, {apolloMocks: mocks});

        await screen.findByText('appA');

        userEvent.click(screen.getAllByRole('button', {name: /delete/})[0]);

        await act(async () => {
            userEvent.click(screen.getByRole('button', {name: /OK/}));
        });

        expect(deleteCalled).toBe(true);
    });
});
