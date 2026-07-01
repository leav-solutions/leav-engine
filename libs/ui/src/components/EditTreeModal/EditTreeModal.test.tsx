import {type QueryResult} from '@apollo/client';
import {type Mockify} from '_ui/__mocks__/utils';
import userEvent from '@testing-library/user-event';
import * as gqlTypes from '_ui/_gqlTypes';
import {mockTreeWithDetails} from '_ui/__mocks__/common/tree';
import {act, fireEvent, render, screen, waitFor, within} from '../../_tests/testUtils';
import EditTreeModal from './EditTreeModal';

vi.mock('../../hooks/useSharedTranslation/useSharedTranslation');

vi.mock('../LibraryPicker', () => ({
    LibraryPicker: () => <div>LibraryPicker</div>,
}));

describe('EditTreeModal', () => {
    const mockResultIsAllowed: Mockify<typeof gqlTypes.useIsAllowedQuery> = {
        loading: false,
        data: {
            isAllowed: [
                {
                    name: gqlTypes.PermissionsActions.admin_edit_tree,
                    allowed: true,
                },
                {
                    name: gqlTypes.PermissionsActions.admin_delete_tree,
                    allowed: true,
                },
                {
                    name: gqlTypes.PermissionsActions.admin_create_tree,
                    allowed: true,
                },
            ],
        },
        called: true,
    };
    vi.spyOn(gqlTypes, 'useIsAllowedQuery').mockImplementation(
        () => mockResultIsAllowed as QueryResult<gqlTypes.IsAllowedQuery, gqlTypes.IsAllowedQueryVariables>,
    );

    const mockGetTreeByIdData = {
        trees: {
            list: [{...mockTreeWithDetails}],
        },
    };

    const mockQueryResultGetTreeById: Mockify<typeof gqlTypes.useGetTreeByIdQuery> = {
        loading: false,
        data: mockGetTreeByIdData,
        called: true,
    };

    describe('Create tree', () => {
        test('Create new tree', async () => {
            const user = userEvent.setup();
            const mockCheckTreeExistenceLazyQuery = vi.fn().mockReturnValue({
                data: {
                    trees: {
                        totalCount: 0,
                    },
                },
            });
            vi.spyOn(gqlTypes, 'useCheckTreeExistenceLazyQuery').mockImplementation(() => [
                mockCheckTreeExistenceLazyQuery,
                null,
            ]);

            const mockSaveTreeMutation = vi.fn().mockReturnValue({
                data: {
                    saveTree: {
                        ...mockTreeWithDetails,
                    },
                },
            });
            vi.spyOn(gqlTypes, 'useSaveTreeMutation').mockImplementation(() => [
                mockSaveTreeMutation,
                {loading: false, called: false, client: null, reset: null, error: null},
            ]);

            const mockOnPostCreate = vi.fn();

            render(<EditTreeModal open onPostCreate={mockOnPostCreate} onClose={vi.fn()} />);

            const inputs = screen.getAllByRole('textbox', {name: /label|id/i});
            const labelFr = inputs[0];
            const labelEn = inputs[1];
            const idField = inputs[2];

            await user.type(labelFr, 'label fr');
            await user.type(labelEn, 'label_en');

            await waitFor(() => {
                expect(idField).toHaveValue('label_fr');
            });

            await act(async () => {
                fireEvent.focus(idField);
                fireEvent.blur(idField);
            });

            await waitFor(() => {
                expect(mockCheckTreeExistenceLazyQuery).toBeCalled();
            });

            expect(screen.queryByText(/id_already_exists/)).not.toBeInTheDocument();

            await user.click(screen.getByRole('button', {name: /submit/i}));

            expect(mockSaveTreeMutation).toBeCalledWith({
                variables: {
                    tree: {
                        id: 'label_fr',
                        label: {
                            fr: 'label fr',
                            en: 'label_en',
                        },
                        behavior: 'standard',
                        libraries: [],
                    },
                },
            });
            expect(mockOnPostCreate).toBeCalled();
        });

        test('Display an error if ID is already used', async () => {
            const user = userEvent.setup();
            const mockCheckTreeExistenceLazyQuery = vi.fn().mockReturnValue({
                data: {
                    trees: {
                        totalCount: 1,
                    },
                },
            });
            vi.spyOn(gqlTypes, 'useCheckTreeExistenceLazyQuery').mockImplementation(() => [
                mockCheckTreeExistenceLazyQuery,
                null,
            ]);

            render(<EditTreeModal open onPostCreate={vi.fn()} onClose={vi.fn()} />);

            const idInput = screen.getByRole('textbox', {name: /id/i});
            await user.type(idInput, 'my_id');
            fireEvent.blur(idInput);

            await waitFor(() => {
                expect(mockCheckTreeExistenceLazyQuery).toBeCalled();
            });

            await waitFor(() => {
                expect(screen.getByText(/id_already_exists/)).toBeInTheDocument();
            });
        });
    });

    describe('Edit existing tree', () => {
        test('Display edit form for existing tree', async () => {
            vi.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(
                () => mockQueryResultGetTreeById as QueryResult,
            );
            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={vi.fn()} />);

            expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();
            expect(screen.queryByRole('button', {name: /submit/i})).not.toBeInTheDocument();
        });

        test('Submit field on blur', async () => {
            const user = userEvent.setup();
            vi.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(
                () => mockQueryResultGetTreeById as QueryResult,
            );
            const mockSaveTreeMutation = vi.fn().mockReturnValue({
                data: {
                    saveTree: {
                        ...mockTreeWithDetails,
                    },
                },
            });
            vi.spyOn(gqlTypes, 'useSaveTreeMutation').mockImplementation(() => [
                mockSaveTreeMutation,
                {loading: false, called: false, client: null, reset: null, error: null},
            ]);

            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={vi.fn()} />);

            const labelFrInput = screen.getByRole('textbox', {name: 'label_fr'});
            expect(labelFrInput).not.toBeDisabled();

            await user.type(labelFrInput, ' modified{enter}');

            expect(labelFrInput).toHaveValue(`${mockTreeWithDetails.label.fr} modified`);

            await waitFor(() => {
                expect(mockSaveTreeMutation).toBeCalledWith({
                    variables: {
                        tree: {
                            id: mockTreeWithDetails.id,
                            label: {
                                ...mockTreeWithDetails.label,
                                fr: `${mockTreeWithDetails.label.fr} modified`,
                            },
                        },
                    },
                });
            });
        });

        test('Can define libraries settings', async () => {
            const user = userEvent.setup();

            const treeWithLibs = {
                ...mockTreeWithDetails,
                libraries: [
                    {
                        library: {
                            id: 'libA',
                            label: {
                                fr: 'Lib A',
                                en: 'Lib A',
                            },
                        },
                        settings: {
                            allowedAtRoot: true,
                            allowMultiplePositions: false,
                            allowedChildren: [],
                        },
                    },
                    {
                        library: {
                            id: 'libB',
                            label: {
                                fr: 'Lib B',
                                en: 'Lib B',
                            },
                        },
                        settings: {
                            allowedAtRoot: false,
                            allowMultiplePositions: false,
                            allowedChildren: [],
                        },
                    },
                ],
            };

            const mockJestResultNoLibs: Mockify<typeof gqlTypes.useGetTreeByIdQuery> = {
                ...mockQueryResultGetTreeById,
                data: {
                    trees: {
                        list: [treeWithLibs],
                    },
                },
            };
            vi.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(() => mockJestResultNoLibs as QueryResult);

            const mockSaveTreeMutation = vi.fn().mockReturnValue({
                data: {
                    saveTree: {
                        ...treeWithLibs,
                    },
                },
            });
            vi.spyOn(gqlTypes, 'useSaveTreeMutation').mockImplementation(() => [
                mockSaveTreeMutation,
                {loading: false, called: false, client: null, reset: null, error: null},
            ]);

            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={vi.fn()} />);

            const listItems = await screen.findAllByRole('listitem');
            expect(listItems).toHaveLength(2);
            const libA = listItems[0];

            userEvent.click(within(libA).getByText(/advanced_settings/i));

            const switches = await within(libA).findAllByRole(
                'switch',
                {},
                {
                    timeout: 10000,
                },
            );
            const allowedMultiplePositionsSwitch = switches[0];
            const allowedAtRootSwitch = switches[1];

            expect(allowedMultiplePositionsSwitch).not.toBeChecked();
            expect(allowedAtRootSwitch).toBeChecked();
            expect(within(libA).getByLabelText(/allowed_children/)).toBeInTheDocument();

            await act(async () => {
                await user.click(allowedMultiplePositionsSwitch);
            });

            await waitFor(() => {
                expect(mockSaveTreeMutation).toBeCalledWith({
                    variables: {
                        tree: {
                            id: mockTreeWithDetails.id,
                            libraries: [
                                {
                                    library: 'libA',
                                    settings: {
                                        allowedAtRoot: true,
                                        allowMultiplePositions: true,
                                        allowedChildren: [],
                                    },
                                },
                                {
                                    library: 'libB',
                                    settings: {
                                        allowedAtRoot: false,
                                        allowMultiplePositions: false,
                                        allowedChildren: [],
                                    },
                                },
                            ],
                        },
                    },
                });
            });
        });

        test('Can add libraries', async () => {
            vi.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(
                () => mockQueryResultGetTreeById as QueryResult,
            );
            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={vi.fn()} />);

            await userEvent.click(screen.getByRole('button', {name: /add_libraries/i}));

            expect(screen.getByText('LibraryPicker')).toBeInTheDocument();
        });

        test('Can delete trees', async () => {
            const treeWithLibs = {
                ...mockTreeWithDetails,
                libraries: [
                    {
                        library: {
                            id: 'libA',
                            label: {
                                fr: 'Lib A',
                                en: 'Lib A',
                            },
                        },
                        settings: {
                            allowedAtRoot: true,
                            allowMultiplePositions: false,
                            allowedChildren: [],
                        },
                    },
                    {
                        library: {
                            id: 'libB',
                            label: {
                                fr: 'Lib B',
                                en: 'Lib B',
                            },
                        },
                        settings: {
                            allowedAtRoot: false,
                            allowMultiplePositions: false,
                            allowedChildren: [],
                        },
                    },
                ],
            };

            const mockJestResultWithLibs: Mockify<typeof gqlTypes.useGetTreeByIdQuery> = {
                ...mockQueryResultGetTreeById,
                data: {
                    trees: {
                        list: [treeWithLibs],
                    },
                },
            };
            vi.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(() => mockJestResultWithLibs as QueryResult);

            const mockSaveTreeMutation = vi.fn().mockReturnValue({
                data: {
                    saveTree: {
                        ...treeWithLibs,
                    },
                },
            });
            vi.spyOn(gqlTypes, 'useSaveTreeMutation').mockImplementation(() => [
                mockSaveTreeMutation,
                {loading: false, called: false, client: null, reset: null, error: null},
            ]);

            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={vi.fn()} />);

            const listItems = await screen.findAllByRole('listitem');
            expect(listItems).toHaveLength(2);
            const libA = listItems[0];

            userEvent.click(within(libA).getByRole('button', {name: /delete/}));

            await waitFor(
                () => {
                    expect(mockSaveTreeMutation).toBeCalledWith({
                        variables: {
                            tree: {
                                id: mockTreeWithDetails.id,
                                libraries: [
                                    {
                                        library: 'libB',
                                        settings: {
                                            allowedAtRoot: false,
                                            allowMultiplePositions: false,
                                            allowedChildren: [],
                                        },
                                    },
                                ],
                            },
                        },
                    });
                },
                {timeout: 10000},
            );
        });
    });

    describe('Delete tree', () => {
        test('Can delete tree', async () => {
            const user = userEvent.setup();
            vi.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(
                () => mockQueryResultGetTreeById as QueryResult,
            );
            const mockDeleteTreeMutation = vi.fn().mockReturnValue({
                data: {
                    deleteTree: {
                        __typename: 'Tree',
                        id: mockTreeWithDetails.id,
                    },
                },
            });
            vi.spyOn(gqlTypes, 'useDeleteTreeMutation').mockImplementation(() => [
                mockDeleteTreeMutation,
                {loading: false, called: false, client: null, reset: null, error: null},
            ]);

            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={vi.fn()} />);

            await user.click(screen.getByRole('button', {name: /trees\.delete/i}));
            await user.click(screen.getByRole('button', {name: /submit/i})); // confirm

            await waitFor(
                () => {
                    expect(mockDeleteTreeMutation).toBeCalledWith({
                        variables: {
                            id: mockTreeWithDetails.id,
                        },
                    });
                },
                {
                    timeout: 10000,
                },
            );
        });

        test('If not allowed, cannot delete tree', async () => {
            const mockResultIsAllowedForbidden: Mockify<typeof gqlTypes.useIsAllowedQuery> = {
                loading: false,
                data: {
                    isAllowed: [
                        {
                            name: gqlTypes.PermissionsActions.admin_edit_tree,
                            allowed: true,
                        },
                        {
                            name: gqlTypes.PermissionsActions.admin_delete_tree,
                            allowed: false,
                        },
                        {
                            name: gqlTypes.PermissionsActions.admin_create_tree,
                            allowed: true,
                        },
                    ],
                },
                called: true,
            };
            vi.spyOn(gqlTypes, 'useIsAllowedQuery').mockImplementation(
                () =>
                    mockResultIsAllowedForbidden as QueryResult<
                        gqlTypes.IsAllowedQuery,
                        gqlTypes.IsAllowedQueryVariables
                    >,
            );

            vi.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(
                () => mockQueryResultGetTreeById as QueryResult,
            );
            const mockDeleteTreeMutation = vi.fn().mockReturnValue({
                data: {
                    deleteTree: {
                        __typename: 'Tree',
                        id: mockTreeWithDetails.id,
                    },
                },
            });
            vi.spyOn(gqlTypes, 'useDeleteTreeMutation').mockImplementation(() => [
                mockDeleteTreeMutation,
                {loading: false, called: false, client: null, reset: null, error: null},
            ]);

            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={vi.fn()} />);

            expect(screen.queryByRole('button', {name: /trees\.delete/i})).not.toBeInTheDocument();
        });
    });
});
