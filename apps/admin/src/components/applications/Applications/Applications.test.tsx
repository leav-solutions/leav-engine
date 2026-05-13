import userEvent from '@testing-library/user-event';
import {render, screen, waitFor} from '../../../_tests/testUtils';
import {mockApplication} from '../../../__mocks__/common/applications';
import Applications from './Applications';
import {DeleteApplicationDocument, GetApplicationsDocument} from '../../../_gqlTypes';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Applications', () => {
    test('Display list of applications, filter and edit', async () => {
        const mocks = [
            {
                request: {
                    query: GetApplicationsDocument,
                    variables: {filters: {}},
                },
                result: {
                    data: {
                        applications: {
                            list: [
                                {...mockApplication, id: 'appA'},
                                {...mockApplication, id: 'appB'},
                            ],
                        },
                    },
                },
            },
            {
                request: {
                    query: GetApplicationsDocument,
                    variables: {filters: {id: '%B%'}},
                },
                result: {
                    data: {
                        applications: {
                            list: [{...mockApplication, id: 'appB'}],
                        },
                    },
                },
            },
        ];

        render(<Applications />, {apolloMocks: mocks});

        expect(await screen.findByText('appA')).toBeInTheDocument();
        expect(await screen.findByText('appB')).toBeInTheDocument();

        // Filter list
        await userEvent.type(screen.getByRole('textbox', {name: /id/}), 'B');

        expect(await screen.findByText('appB')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('appA')).not.toBeInTheDocument());

        await userEvent.click(screen.getByText('appB'));
        expect(mockNavigate).toHaveBeenCalledWith('/applications/edit/appB');
    });

    test('Can delete an application', async () => {
        let deleteCalled = false;
        const mocks = [
            {
                request: {
                    query: GetApplicationsDocument,
                    variables: {filters: {}},
                },
                result: {
                    data: {
                        applications: {
                            list: [
                                {...mockApplication, id: 'appA'},
                                {...mockApplication, id: 'appB'},
                            ],
                        },
                    },
                },
            },
            {
                request: {
                    query: DeleteApplicationDocument,
                    variables: {appId: 'appA'},
                },
                result: () => {
                    deleteCalled = true;
                    return {
                        data: {
                            deleteApplication: {
                                id: 'appA ',
                            },
                        },
                    };
                },
            },
        ];

        render(<Applications />, {apolloMocks: mocks});

        await screen.findByText('appA');

        await userEvent.click(screen.getAllByRole('button', {name: /delete/})[0]);

        await userEvent.click(await screen.findByText('OK'));

        expect(deleteCalled).toBe(true);
    });

    test('Cannot delete a system application', async () => {
        const mocks = [
            {
                request: {
                    query: GetApplicationsDocument,
                    variables: {filters: {}},
                },
                result: {
                    data: {
                        applications: {
                            list: [{...mockApplication, id: 'appA', system: true}],
                        },
                    },
                },
            },
        ];

        render(<Applications />, {apolloMocks: mocks});

        await screen.findByText('appA');

        expect(screen.queryByRole('button', {name: /delete/})).not.toBeInTheDocument();
    });
});
