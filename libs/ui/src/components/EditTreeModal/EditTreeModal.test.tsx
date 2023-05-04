// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult} from '@apollo/client';
import {Mockify} from '@leav/utils';
import userEvent from '@testing-library/user-event';
import * as gqlTypes from '../../_gqlTypes';
import {act, fireEvent, render, screen, waitFor, within} from '../../_tests/testUtils';
import {mockTreeWithDetails} from '../../__mocks__/common/tree';
import EditTreeModal from './EditTreeModal';

jest.mock('../LibraryPicker', () => {
    return {
        LibraryPicker: () => {
            return <div>LibraryPicker</div>;
        }
    };
});

describe('EditTreeModal', () => {
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
            const idField = screen.getByRole('textbox', {name: /id/});

            await user.type(screen.getByRole('textbox', {name: 'label_fr'}), 'label fr');
            await user.type(screen.getByRole('textbox', {name: 'label_en'}), 'label_en');

            await waitFor(() => {
                expect(idField).toHaveValue('label_fr');
            });

            await act(async () => {
                fireEvent.focus(screen.getByRole('textbox', {name: /id/i}));
                fireEvent.blur(screen.getByRole('textbox', {name: /id/i}));
            });

            await waitFor(() => {
                expect(mockCheckTreeExistenceLazyQuery).toBeCalled();
            });

            expect(screen.queryByText(/id_already_exists/)).not.toBeInTheDocument();

            user.click(screen.getByRole('button', {name: /submit/i}));

            await waitFor(() => {
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
        const mockGetTreeByIdData = {
            trees: {
                list: [{...mockTreeWithDetails}]
            }
        };

        const mockJestResult: Mockify<typeof gqlTypes.useGetTreeByIdQuery> = {
            loading: false,
            data: mockGetTreeByIdData,
            called: true
        };

        test('Display edit form for existing tree', async () => {
            jest.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(() => mockJestResult as QueryResult);
            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={jest.fn()} />);

            expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();
            expect(screen.queryByRole('button', {name: /submit/i})).not.toBeInTheDocument();
        });

        test('Submit field on blur', async () => {
            const user = userEvent.setup();
            jest.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(() => mockJestResult as QueryResult);
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
                ...mockJestResult,
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

            expect(await within(libA).findByRole('switch', {name: /allowed_multiple_positions/})).not.toBeChecked();
            expect(within(libA).getByRole('switch', {name: /allowed_at_root/})).toBeChecked();
            expect(within(libA).getByLabelText(/allowed_children/)).toBeInTheDocument();

            await userEvent.click(within(libA).getByRole('switch', {name: /allowed_multiple_positions/}));

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
            jest.spyOn(gqlTypes, 'useGetTreeByIdQuery').mockImplementation(() => mockJestResult as QueryResult);
            render(<EditTreeModal treeId={mockTreeWithDetails.id} open onClose={jest.fn()} />);

            await userEvent.click(screen.getByRole('button', {name: /add_libraries/i}));

            expect(screen.getByText('LibraryPicker')).toBeInTheDocument();
        });

        test('Can delete libraries', async () => {
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
                ...mockJestResult,
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

            await waitFor(() => {
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
            });
        });
    });
});
