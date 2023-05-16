// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult} from '@apollo/client';
import {Mockify} from '@leav/utils';
import userEvent from '@testing-library/user-event';
import * as gqlTypes from '../../_gqlTypes';
import {act, fireEvent, render, screen, waitFor} from '../../_tests/testUtils';
import {mockLibraryWithDetails} from '../../__mocks__/common/library';
import EditLibraryModal from './EditLibraryModal';

describe('EditLibraryModal', () => {
    const mockResultIsAllowed: Mockify<typeof gqlTypes.useIsAllowedQuery> = {
        loading: false,
        data: {
            isAllowed: [
                {
                    name: gqlTypes.PermissionsActions.admin_edit_library,
                    allowed: true
                },
                {
                    name: gqlTypes.PermissionsActions.admin_delete_library,
                    allowed: true
                },
                {
                    name: gqlTypes.PermissionsActions.admin_create_library,
                    allowed: true
                }
            ]
        },
        called: true
    };
    jest.spyOn(gqlTypes, 'useIsAllowedQuery').mockImplementation(
        () => mockResultIsAllowed as QueryResult<gqlTypes.IsAllowedQuery, gqlTypes.IsAllowedQueryVariables>
    );

    const mockGetLibraryByIdData = {
        libraries: {
            list: [
                {
                    ...mockLibraryWithDetails,
                    recordIdentityConf: {
                        ...mockLibraryWithDetails.recordIdentityConf,
                        __typename: 'RecordIdentityConf'
                    }
                }
            ]
        }
    };
    const mockResultGetLibById: Mockify<typeof gqlTypes.useGetLibraryByIdQuery> = {
        loading: false,
        data: mockGetLibraryByIdData,
        called: true
    };

    describe('Create library', () => {
        test('Create new library', async () => {
            const user = userEvent.setup();
            const mockCheckLibraryExistenceLazyQuery = jest.fn().mockReturnValue({
                data: {
                    libraries: {
                        totalCount: 0
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useCheckLibraryExistenceLazyQuery').mockImplementation(() => [
                mockCheckLibraryExistenceLazyQuery,
                null
            ]);

            const mockSaveLibraryMutation = jest.fn().mockReturnValue({
                data: {
                    saveLibrary: {
                        ...mockLibraryWithDetails
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useSaveLibraryMutation').mockImplementation(() => [
                mockSaveLibraryMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            const mockOnPostCreate = jest.fn();

            render(<EditLibraryModal open onPostCreate={mockOnPostCreate} onClose={jest.fn()} />);

            const inputs = await screen.findAllByRole('textbox', {name: /label|id/i});
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

            expect(mockCheckLibraryExistenceLazyQuery).toBeCalled();

            expect(screen.queryByText(/id_already_exists/)).not.toBeInTheDocument();

            await user.click(screen.getByRole('button', {name: /submit/i}));

            expect(mockSaveLibraryMutation).toBeCalledWith({
                variables: {
                    library: {
                        id: 'label_fr',
                        label: {
                            fr: 'label fr',
                            en: 'label_en'
                        },
                        behavior: 'standard'
                    }
                }
            });
            expect(mockOnPostCreate).toBeCalled();
        });

        test('Display an error if ID is already used', async () => {
            const user = userEvent.setup();
            const mockCheckLibraryExistenceLazyQuery = jest.fn().mockReturnValue({
                data: {
                    libraries: {
                        totalCount: 1
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useCheckLibraryExistenceLazyQuery').mockImplementation(() => [
                mockCheckLibraryExistenceLazyQuery,
                null
            ]);

            render(<EditLibraryModal open onPostCreate={jest.fn()} onClose={jest.fn()} />);

            const idInput = screen.getByRole('textbox', {name: /id/i});
            await user.type(idInput, 'my_id');
            fireEvent.blur(idInput);

            await waitFor(() => {
                expect(mockCheckLibraryExistenceLazyQuery).toBeCalled();
            });

            await waitFor(() => {
                expect(screen.getByText(/id_already_exists/)).toBeInTheDocument();
            });
        });
    });

    describe('Edit existing library', () => {
        test('Display edit form for existing library', async () => {
            jest.spyOn(gqlTypes, 'useGetLibraryByIdQuery').mockImplementation(
                () => mockResultGetLibById as QueryResult
            );
            render(<EditLibraryModal libraryId={mockLibraryWithDetails.id} open onClose={jest.fn()} />);

            expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();
            expect(screen.getByRole('combobox', {name: /behavior/})).toBeDisabled();
            expect(screen.queryByRole('button', {name: /submit/i})).not.toBeInTheDocument();
            expect(screen.getAllByRole('combobox', {name: /label|preview|color|treeColorPreview/i})).toHaveLength(4);
        });

        test('Submit field on blur', async () => {
            const user = userEvent.setup();
            jest.spyOn(gqlTypes, 'useGetLibraryByIdQuery').mockImplementation(
                () => mockResultGetLibById as QueryResult
            );
            const mockSaveLibraryMutation = jest.fn().mockReturnValue({
                data: {
                    saveLibrary: {
                        ...mockLibraryWithDetails
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useSaveLibraryMutation').mockImplementation(() => [
                mockSaveLibraryMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditLibraryModal libraryId={mockLibraryWithDetails.id} open onClose={jest.fn()} />);

            const labelFrInput = screen.getByRole('textbox', {name: 'label_fr'});
            expect(labelFrInput).not.toBeDisabled();

            await user.type(labelFrInput, ' modified{enter}');

            expect(labelFrInput).toHaveValue(`${mockLibraryWithDetails.label.fr} modified`);

            await waitFor(() => {
                expect(mockSaveLibraryMutation).toBeCalledWith({
                    variables: {
                        library: {
                            id: mockLibraryWithDetails.id,
                            label: {
                                ...mockLibraryWithDetails.label,
                                fr: `${mockLibraryWithDetails.label.fr} modified`
                            }
                        }
                    }
                });
            });
        });

        test('Submit select field on change', async () => {
            const user = userEvent.setup();
            jest.spyOn(gqlTypes, 'useGetLibraryByIdQuery').mockImplementation(
                () => mockResultGetLibById as QueryResult
            );
            const mockSaveLibraryMutation = jest.fn().mockReturnValue({
                data: {
                    saveLibrary: {
                        ...mockLibraryWithDetails
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useSaveLibraryMutation').mockImplementation(() => [
                mockSaveLibraryMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditLibraryModal libraryId={mockLibraryWithDetails.id} open onClose={jest.fn()} />);

            const labelSelect = screen.getByRole('combobox', {name: /label/i});
            expect(labelSelect).not.toBeDisabled();

            await user.click(labelSelect);

            const labelOption = screen.getByText(mockLibraryWithDetails.attributes[0].label.fr);
            expect(labelOption).toBeInTheDocument();
            user.click(labelOption);

            await waitFor(
                () => {
                    expect(mockSaveLibraryMutation).toBeCalledWith({
                        variables: {
                            library: {
                                id: mockLibraryWithDetails.id,
                                recordIdentityConf: {
                                    ...mockLibraryWithDetails.recordIdentityConf,
                                    label: mockLibraryWithDetails.attributes[0].id
                                }
                            }
                        }
                    });
                },
                {
                    timeout: 10000
                }
            );
        });
    });

    describe('Delete library', () => {
        test('Can delete library', async () => {
            const user = userEvent.setup();
            jest.spyOn(gqlTypes, 'useGetLibraryByIdQuery').mockImplementation(
                () => mockResultGetLibById as QueryResult
            );
            const mockDeleteLibraryMutation = jest.fn().mockReturnValue({
                data: {
                    deleteLibrary: {
                        __typename: 'Library',
                        id: mockLibraryWithDetails.id
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useDeleteLibraryMutation').mockImplementation(() => [
                mockDeleteLibraryMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditLibraryModal libraryId={mockLibraryWithDetails.id} open onClose={jest.fn()} />);

            await user.click(screen.getByRole('button', {name: /delete/i}));
            await user.click(screen.getByRole('button', {name: /submit/i})); // confirm

            await waitFor(
                () => {
                    expect(mockDeleteLibraryMutation).toBeCalledWith({
                        variables: {
                            id: mockLibraryWithDetails.id
                        }
                    });
                },
                {
                    timeout: 10000
                }
            );
        });

        test('If not allowed, cannot delete library', async () => {
            const mockResultIsAllowedForbidden: Mockify<typeof gqlTypes.useIsAllowedQuery> = {
                loading: false,
                data: {
                    isAllowed: [
                        {
                            name: gqlTypes.PermissionsActions.admin_edit_library,
                            allowed: true
                        },
                        {
                            name: gqlTypes.PermissionsActions.admin_delete_library,
                            allowed: false
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

            jest.spyOn(gqlTypes, 'useGetLibraryByIdQuery').mockImplementation(
                () => mockResultGetLibById as QueryResult
            );
            const mockDeleteLibraryMutation = jest.fn().mockReturnValue({
                data: {
                    deleteLibrary: {
                        __typename: 'Library',
                        id: mockLibraryWithDetails.id
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useDeleteLibraryMutation').mockImplementation(() => [
                mockDeleteLibraryMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditLibraryModal libraryId={mockLibraryWithDetails.id} open onClose={jest.fn()} />);

            expect(screen.queryByRole('button', {name: /delete/i})).not.toBeInTheDocument();
        });
    });
});
