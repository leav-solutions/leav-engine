// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult} from '@apollo/client';
import {Mockify} from '@leav/utils';
import userEvent from '@testing-library/user-event';
import * as gqlTypes from '../../_gqlTypes';
import {act, fireEvent, render, screen, waitFor} from '../../_tests/testUtils';
import {mockAttributeWithDetails} from '../../__mocks__/common/attribute';
import EditAttributeModal from './EditAttributeModal';

describe('EditAttributeModal', () => {
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

            user.click(screen.getByRole('button', {name: /submit/i}));

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
        const mockGetAttributeByIdData = {
            attributes: {
                list: [{...mockAttributeWithDetails}]
            }
        };

        const mockJestResult: Mockify<typeof gqlTypes.useGetAttributeByIdQuery> = {
            loading: false,
            data: mockGetAttributeByIdData,
            called: true
        };

        test('Display edit form for existing attribute', async () => {
            jest.spyOn(gqlTypes, 'useGetAttributeByIdQuery').mockImplementation(() => mockJestResult as QueryResult);
            render(<EditAttributeModal attributeId={mockAttributeWithDetails.id} open onClose={jest.fn()} />);

            expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();
            expect(screen.getByRole('combobox', {name: /type/})).toBeDisabled();
            expect(screen.getByRole('combobox', {name: /format/})).toBeDisabled();
            expect(screen.queryByRole('button', {name: /submit/i})).not.toBeInTheDocument();
        });

        test('Submit field on blur', async () => {
            const user = userEvent.setup();
            jest.spyOn(gqlTypes, 'useGetAttributeByIdQuery').mockImplementation(() => mockJestResult as QueryResult);
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
            jest.spyOn(gqlTypes, 'useGetAttributeByIdQuery').mockImplementation(() => mockJestResult as QueryResult);
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
    });
});
