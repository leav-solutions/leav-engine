// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult} from '@apollo/client';
import {Mockify} from '@leav/utils';
import userEvent from '@testing-library/user-event';
import {mockTreeWithDetails} from '../../__mocks__/common/tree';
import * as gqlTypes from '../../_gqlTypes';
import {act, fireEvent, render, screen, waitFor, within} from '../../_tests/testUtils';
import EditTreeModal from './EditTreeModal';

jest.mock('../../hooks/useSharedTranslation/useSharedTranslation');

jest.mock('../LibraryPicker', () => {
    return {
        LibraryPicker: () => {
            return <div>LibraryPicker</div>;
        }
    };
});

describe('EditTreeModal', () => {
    const mockResultIsAllowed: Mockify<typeof gqlTypes.useIsAllowedQuery> = {
        loading: false,
        data: {
            isAllowed: [
                {
                    name: gqlTypes.PermissionsActions.admin_edit_tree,
                    allowed: true
                },
                {
                    name: gqlTypes.PermissionsActions.admin_delete_tree,
                    allowed: true
                },
                {
                    name: gqlTypes.PermissionsActions.admin_create_tree,
                    allowed: true
                }
            ]
        },
        called: true
    };
    jest.spyOn(gqlTypes, 'useIsAllowedQuery').mockImplementation(
        () => mockResultIsAllowed as QueryResult<gqlTypes.IsAllowedQuery, gqlTypes.IsAllowedQueryVariables>
    );

    const mockGetTreeByIdData = {
        trees: {
            list: [{...mockTreeWithDetails}]
        }
    };

    const mockQueryResultGetTreeById: Mockify<typeof gqlTypes.useGetTreeByIdQuery> = {
        loading: false,
        data: mockGetTreeByIdData,
        called: true
    };

    describe('Create tree', () => {
        test('Create new tree', async () => {
            const user = userEvent.setup();
            const mockCheckTreeExistenceLazyQuery = jest.fn().mockReturnValue({
                data: {
                    trees: {
                        totalCount: 0
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useCheckTreeExistenceLazyQuery').mockImplementation(() => [
                mockCheckTreeExistenceLazyQuery,
                null
            ]);

            const mockSaveTreeMutation = jest.fn().mockReturnValue({
                data: {
                    saveTree: {
                        ...mockTreeWithDetails
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useSaveTreeMutation').mockImplementation(() => [
                mockSaveTreeMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            const mockOnPostCreate = jest.fn();

            render(<EditTreeModal open onPostCreate={mockOnPostCreate} onClose={jest.fn()} />);

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
                            en: 'label_en'
                        },
                        behavior: 'standard',
                        libraries: []
                    }
                }
            });
            expect(mockOnPostCreate).toBeCalled();
        });

        test('Display an error if ID is already used', async () => {
            const user = userEvent.setup();
            const mockCheckTreeExistenceLazyQuery = jest.fn().mockReturnValue({
                data: {
                    trees: {
                        totalCount: 1
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useCheckTreeExistenceLazyQuery').mockImplementation(() => [
                mockCheckTreeExistenceLazyQuery,
                null
            ]);

            render(<EditTreeModal open onPostCreate={jest.fn()} onClose={jest.fn()} />);

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
            jest.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(
                () => mockQueryResultGetTreeById as QueryResult
            );
            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={jest.fn()} />);

            expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();
            expect(screen.queryByRole('button', {name: /submit/i})).not.toBeInTheDocument();
        });

        test('Submit field on blur', async () => {
            const user = userEvent.setup();
            jest.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(
                () => mockQueryResultGetTreeById as QueryResult
            );
            const mockSaveTreeMutation = jest.fn().mockReturnValue({
                data: {
                    saveTree: {
                        ...mockTreeWithDetails
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useSaveTreeMutation').mockImplementation(() => [
                mockSaveTreeMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={jest.fn()} />);

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
                                fr: `${mockTreeWithDetails.label.fr} modified`
                            }
                        }
                    }
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
                                en: 'Lib A'
                            }
                        },
                        settings: {
                            allowedAtRoot: true,
                            allowMultiplePositions: false,
                            allowedChildren: []
                        }
                    },
                    {
                        library: {
                            id: 'libB',
                            label: {
                                fr: 'Lib B',
                                en: 'Lib B'
                            }
                        },
                        settings: {
                            allowedAtRoot: false,
                            allowMultiplePositions: false,
                            allowedChildren: []
                        }
                    }
                ]
            };

            const mockJestResultNoLibs: Mockify<typeof gqlTypes.useGetTreeByIdQuery> = {
                ...mockQueryResultGetTreeById,
                data: {
                    trees: {
                        list: [treeWithLibs]
                    }
                }
            };
            jest.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(() => mockJestResultNoLibs as QueryResult);

            const mockSaveTreeMutation = jest.fn().mockReturnValue({
                data: {
                    saveTree: {
                        ...treeWithLibs
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useSaveTreeMutation').mockImplementation(() => [
                mockSaveTreeMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={jest.fn()} />);

            const listItems = await screen.findAllByRole('listitem');
            expect(listItems).toHaveLength(2);
            const libA = listItems[0];

            userEvent.click(within(libA).getByText(/advanced_settings/i));

            const switches = await within(libA).findAllByRole(
                'switch',
                {},
                {
                    timeout: 10000
                }
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
                                        allowedChildren: []
                                    }
                                },
                                {
                                    library: 'libB',
                                    settings: {
                                        allowedAtRoot: false,
                                        allowMultiplePositions: false,
                                        allowedChildren: []
                                    }
                                }
                            ]
                        }
                    }
                });
            });
        });

        test('Can add libraries', async () => {
            jest.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(
                () => mockQueryResultGetTreeById as QueryResult
            );
            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={jest.fn()} />);

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
                                en: 'Lib A'
                            }
                        },
                        settings: {
                            allowedAtRoot: true,
                            allowMultiplePositions: false,
                            allowedChildren: []
                        }
                    },
                    {
                        library: {
                            id: 'libB',
                            label: {
                                fr: 'Lib B',
                                en: 'Lib B'
                            }
                        },
                        settings: {
                            allowedAtRoot: false,
                            allowMultiplePositions: false,
                            allowedChildren: []
                        }
                    }
                ]
            };

            const mockJestResultWithLibs: Mockify<typeof gqlTypes.useGetTreeByIdQuery> = {
                ...mockQueryResultGetTreeById,
                data: {
                    trees: {
                        list: [treeWithLibs]
                    }
                }
            };
            jest.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(() => mockJestResultWithLibs as QueryResult);

            const mockSaveTreeMutation = jest.fn().mockReturnValue({
                data: {
                    saveTree: {
                        ...treeWithLibs
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useSaveTreeMutation').mockImplementation(() => [
                mockSaveTreeMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={jest.fn()} />);

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
                                            allowedChildren: []
                                        }
                                    }
                                ]
                            }
                        }
                    });
                },
                {timeout: 10000}
            );
        });
    });

    describe('Delete tree', () => {
        test('Can delete tree', async () => {
            const user = userEvent.setup();
            jest.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(
                () => mockQueryResultGetTreeById as QueryResult
            );
            const mockDeleteTreeMutation = jest.fn().mockReturnValue({
                data: {
                    deleteTree: {
                        __typename: 'Tree',
                        id: mockTreeWithDetails.id
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useDeleteTreeMutation').mockImplementation(() => [
                mockDeleteTreeMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={jest.fn()} />);

            await user.click(screen.getByRole('button', {name: /trees\.delete/i}));
            await user.click(screen.getByRole('button', {name: /submit/i})); // confirm

            await waitFor(
                () => {
                    expect(mockDeleteTreeMutation).toBeCalledWith({
                        variables: {
                            id: mockTreeWithDetails.id
                        }
                    });
                },
                {
                    timeout: 10000
                }
            );
        });

        test('If not allowed, cannot delete tree', async () => {
            const mockResultIsAllowedForbidden: Mockify<typeof gqlTypes.useIsAllowedQuery> = {
                loading: false,
                data: {
                    isAllowed: [
                        {
                            name: gqlTypes.PermissionsActions.admin_edit_tree,
                            allowed: true
                        },
                        {
                            name: gqlTypes.PermissionsActions.admin_delete_tree,
                            allowed: false
                        },
                        {
                            name: gqlTypes.PermissionsActions.admin_create_tree,
                            allowed: true
                        }
                    ]
                },
                called: true
            };
            jest.spyOn(gqlTypes, 'useIsAllowedQuery').mockImplementation(
                () =>
                    mockResultIsAllowedForbidden as QueryResult<
                        gqlTypes.IsAllowedQuery,
                        gqlTypes.IsAllowedQueryVariables
                    >
            );

            jest.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(
                () => mockQueryResultGetTreeById as QueryResult
            );
            const mockDeleteTreeMutation = jest.fn().mockReturnValue({
                data: {
                    deleteTree: {
                        __typename: 'Tree',
                        id: mockTreeWithDetails.id
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useDeleteTreeMutation').mockImplementation(() => [
                mockDeleteTreeMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={jest.fn()} />);

            expect(screen.queryByRole('button', {name: /trees\.delete/i})).not.toBeInTheDocument();
        });
    });
});
