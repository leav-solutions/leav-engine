// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as leavUi from '@leav/ui';
import userEvent from '@testing-library/user-event';
import {mockApplicationDetails} from '__mocks__/common/applications';
import {mockLibrary, mockLibraryPermissions} from '__mocks__/common/library';
import {render, screen, waitFor} from '_tests/testUtils';
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {mockDndSpacing} from 'react-beautiful-dnd-test-utils';
import LibrariesSettings from './LibrariesSettings';

describe('LibrariesSettings', () => {
    const {type, ...mockGqlNamesWithoutType} = mockLibrary.gqlNames;
    const mockLibBase = {
        ...mockLibrary,
        gqlNames: mockGqlNamesWithoutType,
        permissions: mockLibraryPermissions
    };

    const currentApp = {
        ...mockApplicationDetails,
        settings: {
            libraries: 'all'
        }
    };

    const mocks = [
        {
            request: {
                query: getLibrariesListQuery,
                variables: {
                    filters: {id: []}
                }
            },
            result: {
                data: {
                    libraries: {
                        list: [
                            {
                                ...mockLibBase,
                                id: 'libA',
                                label: {fr: 'Lib A'}
                            },
                            {
                                ...mockLibBase,
                                id: 'libB',
                                label: {fr: 'Lib B'}
                            }
                        ]
                    }
                }
            }
        }
    ];

    const mocksCustomSelection = [
        {
            request: {
                query: getLibrariesListQuery,
                variables: {
                    filters: {id: ['libA', 'libB']}
                }
            },
            result: {
                data: {
                    libraries: {
                        list: [
                            {
                                ...mockLibBase,
                                id: 'libA',
                                label: {fr: 'Lib A'}
                            },
                            {
                                ...mockLibBase,
                                id: 'libB',
                                label: {fr: 'Lib B'}
                            }
                        ]
                    }
                }
            }
        }
    ];

    test('Display list of libraries', async () => {
        render(<LibrariesSettings />, {apolloMocks: mocks, currentApp});

        expect(await screen.findByText('Lib A')).toBeInTheDocument();
        expect(await screen.findByText('Lib B')).toBeInTheDocument();
    });

    test('Can switch from custom selection, to "all libraries" or "non"', async () => {
        const saveAppMutation = jest.fn();
        jest.spyOn(leavUi, 'useSaveApplicationMutation').mockImplementation(() => [
            saveAppMutation,
            {
                loading: false,
                error: null,
                called: false,
                reset: jest.fn(),
                client: null
            }
        ]);

        render(<LibrariesSettings />, {
            apolloMocks: mocksCustomSelection,
            current: {...currentApp, settings: {...currentApp.settings, libraries: 'custom'}}
        });

        expect(await screen.findByRole('radio', {name: /all/})).toBeInTheDocument();
        expect(screen.getByRole('radio', {name: /none/})).toBeInTheDocument();
        expect(screen.getByRole('radio', {name: /custom/})).toBeInTheDocument();

        await waitFor(() => expect(screen.getByRole('radio', {name: /custom/})).toBeChecked());

        userEvent.click(screen.getByRole('radio', {name: /all/})); // Change mode to "all"

        userEvent.click(await screen.findByRole('button', {name: /submit/})); // Confirm

        await waitFor(() => {
            expect(saveAppMutation).toBeCalled();
        });
    });

    test.skip('Can re order libraries', async () => {
        const saveAppMutation = jest.fn();
        jest.spyOn(leavUi, 'useSaveApplicationMutation').mockImplementation(() => [
            saveAppMutation,
            {
                loading: false,
                error: null,
                called: false,
                reset: jest.fn(),
                client: null
            }
        ]);

        const {container} = render(<LibrariesSettings />, {apolloMocks: mocks, currentApp});
        mockDndSpacing(container);

        await waitFor(() => screen.getByText('Lib A'));
        const dragHandle = screen.getAllByRole('button', {name: /holder/})[1]; // Handle of "Lib B"

        //TODO: Find a way to simulate drag and drop
    });

    test('If not allowed, cannot re order libraries', async () => {
        render(<LibrariesSettings />, {
            apolloMocks: mocks,
            currentApp: {
                ...currentApp,
                permissions: {
                    ...currentApp.permissions,
                    admin_application: false
                }
            }
        });

        await waitFor(() => screen.getByText('Lib A'));
        expect(screen.queryByRole('button', {name: /holder/})).not.toBeInTheDocument();
    });

    test('Can remove library from list', async () => {
        const saveAppMutation = jest.fn();
        jest.spyOn(leavUi, 'useSaveApplicationMutation').mockImplementation(() => [
            saveAppMutation,
            {
                loading: false,
                error: null,
                called: false,
                reset: jest.fn(),
                client: null
            }
        ]);

        render(<LibrariesSettings />, {
            apolloMocks: mocksCustomSelection,
            current: {...currentApp, settings: {...currentApp.settings, libraries: ['libA', 'libB']}}
        });

        await waitFor(() => screen.getByText('Lib A'));

        userEvent.click(screen.getAllByRole('img', {name: /remove/})[0]); // Remove "Lib A"

        await waitFor(() => {
            expect(saveAppMutation).toBeCalled();
        });
    });

    test('Can filter list', async () => {
        render(<LibrariesSettings />, {apolloMocks: mocks, currentApp});

        expect(await screen.findByText('Lib A')).toBeInTheDocument();
        expect(screen.getByText('Lib B')).toBeInTheDocument();

        userEvent.type(screen.getByRole('textbox', {name: /search/}), 'Lib A');

        expect(screen.getByText('Lib A')).toBeInTheDocument();
        expect(screen.queryByText('Lib B')).not.toBeInTheDocument();
    });

    describe('Custom mode', () => {
        const currentAppCustomMode = {
            ...currentApp,
            settings: {
                ...currentApp.settings,
                libraries: []
            }
        };

        test('Display a message if nothing selected', async () => {
            render(<LibrariesSettings />, {apolloMocks: mocks, currentApp: currentAppCustomMode});

            expect(await screen.findByText(/no_libraries/)).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /add/})).toBeInTheDocument();
        });

        test('Can add library to list', async () => {
            render(<LibrariesSettings />, {
                apolloMocks: mocksCustomSelection,
                currentApp: {...currentApp, settings: {libraries: ['libA', 'libB']}}
            });

            expect(await screen.findByRole('button', {name: /add/})).toBeInTheDocument();
        });

        test('Can clear all libraries', async () => {
            const saveAppMutation = jest.fn();
            jest.spyOn(leavUi, 'useSaveApplicationMutation').mockImplementation(() => [
                saveAppMutation,
                {
                    loading: false,
                    error: null,
                    called: false,
                    reset: jest.fn(),
                    client: null
                }
            ]);

            render(<LibrariesSettings />, {
                apolloMocks: mocksCustomSelection,
                currentApp: {...currentApp, settings: {libraries: ['libA', 'libB']}}
            });

            userEvent.click(await screen.findByRole('button', {name: /clear/}));
            userEvent.click(await screen.findByRole('button', {name: /submit/})); // Confirm

            await waitFor(() => expect(saveAppMutation).toBeCalled());
            expect(saveAppMutation.mock.calls[0][0].variables.application.settings.libraries).toEqual([]);
        });
    });
});
