// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as leavUi from '@leav/ui';
import userEvent from '@testing-library/user-event';
import {getTreeListQuery} from 'graphQL/queries/trees/getTreeListQuery';
import {mockDndSpacing} from 'react-beautiful-dnd-test-utils';
import {render, screen, waitFor} from '_tests/testUtils';
import {mockApplicationDetails} from '__mocks__/common/applications';
import {mockTree} from '__mocks__/common/tree';
import TreesSettings from './TreesSettings';

describe('TreesSettings', () => {
    const mockTreeBase = {
        ...mockTree,
        permissions: {
            access_tree: true,
            edit_children: true
        }
    };

    const currentApp = {
        ...mockApplicationDetails,
        settings: {
            trees: 'all'
        }
    };

    const mocks = [
        {
            request: {
                query: getTreeListQuery,
                variables: {
                    filters: {id: []}
                }
            },
            result: {
                data: {
                    trees: {
                        list: [
                            {
                                ...mockTreeBase,
                                id: 'treeA',
                                label: {fr: 'Tree A'}
                            },
                            {
                                ...mockTreeBase,
                                id: 'treeB',
                                label: {fr: 'Tree B'}
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
                query: getTreeListQuery,
                variables: {
                    filters: {id: ['treeA', 'treeB']}
                }
            },
            result: {
                data: {
                    trees: {
                        list: [
                            {
                                ...mockTreeBase,
                                id: 'treeA',
                                label: {fr: 'Tree A'}
                            },
                            {
                                ...mockTreeBase,
                                id: 'treeB',
                                label: {fr: 'Tree B'}
                            }
                        ]
                    }
                }
            }
        }
    ];

    test('Display list of trees', async () => {
        render(<TreesSettings />, {apolloMocks: mocks, currentApp});

        expect(await screen.findByText('Tree A')).toBeInTheDocument();
        expect(await screen.findByText('Tree B')).toBeInTheDocument();
    });

    test('Can switch from custom selection, to "all trees" or "non"', async () => {
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

        render(<TreesSettings />, {
            apolloMocks: mocksCustomSelection,
            current: {...currentApp, settings: {...currentApp.settings, trees: 'custom'}}
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

    test.skip('Can re order trees', async () => {
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

        const {container} = render(<TreesSettings />, {apolloMocks: mocks, currentApp});
        mockDndSpacing(container);

        await waitFor(() => screen.getByText('Tree A'));
        const dragHandle = screen.getAllByRole('button', {name: /holder/})[1]; // Handle of "Tree B"

        //TODO: Find a way to simulate drag and drop
    });

    test('If not allowed, cannot re order trees', async () => {
        render(<TreesSettings />, {
            apolloMocks: mocks,
            currentApp: {
                ...currentApp,
                permissions: {
                    ...currentApp.permissions,
                    admin_application: false
                }
            }
        });

        await waitFor(() => screen.getByText('Tree A'));
        expect(screen.queryByRole('button', {name: /holder/})).not.toBeInTheDocument();
    });

    test('Can remove tree from list', async () => {
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

        render(<TreesSettings />, {
            apolloMocks: mocksCustomSelection,
            current: {...currentApp, settings: {...currentApp.settings, trees: ['treeA', 'treeB']}}
        });

        await waitFor(() => screen.getByText('Tree A'));

        userEvent.click(screen.getAllByRole('img', {name: /remove/})[0]); // Remove "Tree A"

        await waitFor(() => {
            expect(saveAppMutation).toBeCalled();
        });
    });

    test('Can filter list', async () => {
        render(<TreesSettings />, {apolloMocks: mocks, currentApp});

        expect(await screen.findByText('Tree A')).toBeInTheDocument();
        expect(screen.getByText('Tree B')).toBeInTheDocument();

        userEvent.type(screen.getByRole('textbox', {name: /search/}), 'Tree A');

        expect(screen.getByText('Tree A')).toBeInTheDocument();
        expect(screen.queryByText('Tree B')).not.toBeInTheDocument();
    });

    describe('Custom mode', () => {
        const currentAppCustomMode = {
            ...currentApp,
            settings: {
                ...currentApp.settings,
                trees: []
            }
        };

        test('Display a message if nothing selected', async () => {
            render(<TreesSettings />, {apolloMocks: mocks, currentApp: currentAppCustomMode});

            expect(await screen.findByText(/no_trees/)).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /add/})).toBeInTheDocument();
        });

        test('Can add tree to list', async () => {
            render(<TreesSettings />, {
                apolloMocks: mocksCustomSelection,
                currentApp: {...currentApp, settings: {trees: ['treeA', 'treeB']}}
            });

            expect(await screen.findByRole('button', {name: /add/})).toBeInTheDocument();
        });
    });
});
