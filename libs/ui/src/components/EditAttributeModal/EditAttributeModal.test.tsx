// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult} from '@apollo/client';
import {Mockify} from '@leav/utils';
import userEvent from '@testing-library/user-event';
import * as gqlTypes from '_ui/_gqlTypes';
import {mockAttributeWithDetails} from '_ui/__mocks__/common/attribute';
import {act, fireEvent, render, screen, waitFor} from '../../_tests/testUtils';
import EditAttributeModal from './EditAttributeModal';

jest.mock('../../hooks/useSharedTranslation/useSharedTranslation');

describe('EditAttributeModal', () => {
    const mockResultIsAllowed: Mockify<typeof gqlTypes.useIsAllowedQuery> = {
        loading: false,
        data: {
            isAllowed: [
                {
                    name: gqlTypes.PermissionsActions.admin_edit_attribute,
                    allowed: true
                },
                {
                    name: gqlTypes.PermissionsActions.admin_delete_attribute,
                    allowed: true
                },
                {
                    name: gqlTypes.PermissionsActions.admin_create_attribute,
                    allowed: true
                }
            ]
        },
        called: true
    };
    jest.spyOn(gqlTypes, 'useIsAllowedQuery').mockImplementation(
        () => mockResultIsAllowed as QueryResult<gqlTypes.IsAllowedQuery, gqlTypes.IsAllowedQueryVariables>
    );

    const mockGetAttributeByIdData = {
        attributes: {
            list: [{...mockAttributeWithDetails}]
        }
    };

    const mockResultGetAttributeById: Mockify<typeof gqlTypes.useGetAttributeByIdQuery> = {
        loading: false,
        data: mockGetAttributeByIdData,
        called: true
    };

    describe('Create attribute', () => {
        test('Create new attribute', async () => {
            const user = userEvent.setup();
            const mockCheckAttributeExistenceLazyQuery = jest.fn().mockReturnValue({
                data: {
                    attributes: {
                        totalCount: 0
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useCheckAttributeExistenceLazyQuery').mockImplementation(() => [
                mockCheckAttributeExistenceLazyQuery,
                null
            ]);

            const mockSaveAttributeMutation = jest.fn().mockReturnValue({
                data: {
                    saveAttribute: {
                        ...mockAttributeWithDetails
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useSaveAttributeMutation').mockImplementation(() => [
                mockSaveAttributeMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            const mockOnPostCreate = jest.fn();

            render(<EditAttributeModal open onPostCreate={mockOnPostCreate} onClose={jest.fn()} />);
            const idField = screen.getByRole('textbox', {name: /id/});

            await user.type(screen.getByRole('textbox', {name: 'label_fr'}), 'label fr');
            await user.type(screen.getByRole('textbox', {name: 'label_en'}), 'label_en');

            await user.type(screen.getByRole('spinbutton', {name: 'global.max_length'}), '5');

            await waitFor(() => {
                expect(idField).toHaveValue('label_fr');
            });

            await act(async () => {
                fireEvent.focus(screen.getByRole('textbox', {name: /id/i}));
                fireEvent.blur(screen.getByRole('textbox', {name: /id/i}));
            });

            await waitFor(() => {
                expect(mockCheckAttributeExistenceLazyQuery).toBeCalled();
            });

            expect(screen.queryByText(/id_already_exists/)).not.toBeInTheDocument();

            await user.click(screen.getByRole('button', {name: /submit/i}));

            await waitFor(() => {
                expect(mockSaveAttributeMutation).toBeCalledWith({
                    variables: {
                        attribute: {
                            id: 'label_fr',
                            label: {
                                fr: 'label fr',
                                en: 'label_en'
                            },
                            description: {
                                fr: '',
                                en: ''
                            },
                            type: gqlTypes.AttributeType.simple,
                            format: gqlTypes.AttributeFormat.text,
                            unique: false,
                            readonly: false,
                            linked_library: null,
                            linked_tree: null,
                            maxLength: 5,
                            multiple_values: false,
                            versions_conf: null
                        }
                    }
                });
                expect(mockOnPostCreate).toBeCalled();
            });
        });

        test('Display an error if ID is already used', async () => {
            const user = userEvent.setup();
            const mockCheckAttributeExistenceLazyQuery = jest.fn().mockReturnValue({
                data: {
                    attributes: {
                        totalCount: 1
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useCheckAttributeExistenceLazyQuery').mockImplementation(() => [
                mockCheckAttributeExistenceLazyQuery,
                null
            ]);

            render(<EditAttributeModal open onPostCreate={jest.fn()} onClose={jest.fn()} />);

            const idInput = screen.getByRole('textbox', {name: /id/i});
            await user.type(idInput, 'my_id');
            fireEvent.blur(idInput);

            await waitFor(() => {
                expect(mockCheckAttributeExistenceLazyQuery).toBeCalled();
            });

            await waitFor(() => {
                expect(screen.getByText(/id_already_exists/)).toBeInTheDocument();
            });
        });
    });

    describe('Edit existing attribute', () => {
        test('Display edit form for existing attribute', async () => {
            jest.spyOn(gqlTypes, 'useGetAttributeByIdQuery').mockImplementation(
                () => mockResultGetAttributeById as QueryResult
            );
            render(<EditAttributeModal attributeId={mockAttributeWithDetails.id} open onClose={jest.fn()} />);

            expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();
            expect(screen.getByRole('combobox', {name: /type/})).toBeDisabled();
            expect(screen.getByRole('combobox', {name: /format/})).toBeDisabled();
            expect(screen.queryByRole('button', {name: /submit/i})).not.toBeInTheDocument();
        });

        test('Submit field on blur', async () => {
            const user = userEvent.setup();
            jest.spyOn(gqlTypes, 'useGetAttributeByIdQuery').mockImplementation(
                () => mockResultGetAttributeById as QueryResult
            );
            const mockSaveAttributeMutation = jest.fn().mockReturnValue({
                data: {
                    saveAttribute: {
                        ...mockAttributeWithDetails
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useSaveAttributeMutation').mockImplementation(() => [
                mockSaveAttributeMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditAttributeModal attributeId={mockAttributeWithDetails.id} open onClose={jest.fn()} />);

            const labelFrInput = screen.getByRole('textbox', {name: 'label_fr'});
            expect(labelFrInput).not.toBeDisabled();

            await user.type(labelFrInput, ' modified{enter}');

            expect(labelFrInput).toHaveValue(`${mockAttributeWithDetails.label.fr} modified`);

            await waitFor(() => {
                expect(mockSaveAttributeMutation).toBeCalledWith({
                    variables: {
                        attribute: {
                            id: mockAttributeWithDetails.id,
                            label: {
                                ...mockAttributeWithDetails.label,
                                fr: `${mockAttributeWithDetails.label.fr} modified`
                            }
                        }
                    }
                });
            });
        });

        test('Submit checkbox field on change', async () => {
            const user = userEvent.setup();
            jest.spyOn(gqlTypes, 'useGetAttributeByIdQuery').mockImplementation(
                () => mockResultGetAttributeById as QueryResult
            );
            const mockSaveAttributeMutation = jest.fn().mockReturnValue({
                data: {
                    saveAttribute: {
                        ...mockAttributeWithDetails
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useSaveAttributeMutation').mockImplementation(() => [
                mockSaveAttributeMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditAttributeModal attributeId={mockAttributeWithDetails.id} open onClose={jest.fn()} />);

            const readonlyCheckbox = screen.getByRole('switch', {name: /readonly/i});
            expect(readonlyCheckbox).not.toBeDisabled();

            await user.click(readonlyCheckbox);

            expect(mockSaveAttributeMutation).toBeCalledWith({
                variables: {
                    attribute: {
                        id: mockAttributeWithDetails.id,
                        readonly: true
                    }
                }
            });
        });

        test('Submit maxLength field on change', async () => {
            const user = userEvent.setup();
            jest.spyOn(gqlTypes, 'useGetAttributeByIdQuery').mockReturnValue(mockResultGetAttributeById as QueryResult);
            const mockSaveAttributeMutation = jest.fn().mockReturnValue({
                data: {
                    saveAttribute: {
                        ...mockAttributeWithDetails
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useSaveAttributeMutation').mockReturnValue([
                mockSaveAttributeMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditAttributeModal attributeId={mockAttributeWithDetails.id} open onClose={jest.fn()} />);

            const maxLengthField = screen.getByRole('spinbutton', {name: /max_length/i});
            expect(maxLengthField).not.toBeDisabled();

            const maxLength = 5;

            await user.type(maxLengthField, maxLength.toString());

            // move the focus away
            await userEvent.click(document.body);

            expect(mockSaveAttributeMutation).toBeCalledWith({
                variables: {
                    attribute: {
                        id: mockAttributeWithDetails.id,
                        maxLength
                    }
                }
            });
        });
    });

    describe('Delete attribute', () => {
        test('Can delete attribute', async () => {
            const user = userEvent.setup();
            jest.spyOn(gqlTypes, 'useGetAttributeByIdQuery').mockImplementation(
                () => mockResultGetAttributeById as QueryResult
            );

            const mockDeleteAttributeMutation = jest.fn().mockReturnValue({
                data: {
                    deleteAttribute: {
                        __typename: 'Attribute',
                        id: mockAttributeWithDetails.id
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useDeleteAttributeMutation').mockImplementation(() => [
                mockDeleteAttributeMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditAttributeModal attributeId={mockAttributeWithDetails.id} open onClose={jest.fn()} />);

            await user.click(screen.getByRole('button', {name: /delete/i}));
            await user.click(screen.getByRole('button', {name: /submit/i})); // confirm

            await waitFor(
                () => {
                    expect(mockDeleteAttributeMutation).toBeCalledWith({
                        variables: {
                            id: mockAttributeWithDetails.id
                        }
                    });
                },
                {
                    timeout: 10000
                }
            );
        });

        test('If not allowed, cannot delete attribute', async () => {
            const mockResultIsAllowedForbidden: Mockify<typeof gqlTypes.useIsAllowedQuery> = {
                loading: false,
                data: {
                    isAllowed: [
                        {
                            name: gqlTypes.PermissionsActions.admin_edit_attribute,
                            allowed: true
                        },
                        {
                            name: gqlTypes.PermissionsActions.admin_delete_attribute,
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

            jest.spyOn(gqlTypes, 'useGetAttributeByIdQuery').mockImplementation(
                () => mockResultGetAttributeById as QueryResult
            );
            const mockDeleteAttributeMutation = jest.fn().mockReturnValue({
                data: {
                    deleteAttribute: {
                        __typename: 'Attribute',
                        id: mockAttributeWithDetails.id
                    }
                }
            });
            jest.spyOn(gqlTypes, 'useDeleteAttributeMutation').mockImplementation(() => [
                mockDeleteAttributeMutation,
                {loading: false, called: false, client: null, reset: null, error: null}
            ]);

            render(<EditAttributeModal attributeId={mockAttributeWithDetails.id} open onClose={jest.fn()} />);

            expect(screen.queryByRole('button', {name: /delete/i})).not.toBeInTheDocument();
        });
    });
});
