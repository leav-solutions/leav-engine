// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {GetAttributesDocument, IsAllowedDocument, PermissionsActions, PermissionTypes} from '_ui/_gqlTypes';
import {mockAttributeSimple} from '_ui/__mocks__/common/attribute';
import {render, screen, waitFor, within} from '../../_tests/testUtils';
import AttributePicker from './AttributePicker';

window.matchMedia = query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
});

jest.mock('../EditAttributeModal', () => {
    return {
        EditAttributeModal: () => {
            return <div>EditAttribute</div>;
        }
    };
});

jest.mock('../../hooks/useSharedTranslation/useSharedTranslation');

describe('AttributePicker', () => {
    const baseMocks = [
        {
            request: {
                query: GetAttributesDocument,
                variables: {pagination: {limit: 20, offset: 0}, filters: {}}
            },
            result: {
                data: {
                    attributes: {
                        totalCount: 3,
                        list: [
                            {
                                ...mockAttributeSimple,
                                format: 'text',
                                id: 'attributeA'
                            },
                            {
                                ...mockAttributeSimple,
                                format: 'numeric',
                                id: 'attributeB'
                            },
                            {
                                ...mockAttributeSimple,
                                format: 'text',
                                id: 'attributeC'
                            }
                        ]
                    }
                }
            }
        },
        {
            request: {
                query: IsAllowedDocument,
                variables: {
                    type: PermissionTypes.admin,
                    actions: [PermissionsActions.admin_create_attribute]
                }
            },
            result: {
                data: {
                    isAllowed: [
                        {
                            name: PermissionsActions.admin_create_attribute,
                            allowed: true
                        }
                    ]
                }
            }
        }
    ];

    test('Display attributes', async () => {
        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks: baseMocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        expect(screen.getByText('attributeA')).toBeInTheDocument();
        expect(screen.getByText('attributeB')).toBeInTheDocument();
        expect(screen.getByText('attributeC')).toBeInTheDocument();
    });

    test('Can filter list', async () => {
        const mocksWithFilters = [
            ...baseMocks,
            {
                request: {
                    query: GetAttributesDocument,
                    variables: {pagination: {limit: 20, offset: 0}, filters: {label: '%attributeA%'}}
                },
                result: {
                    data: {
                        attributes: {
                            totalCount: 1,
                            list: [
                                {
                                    ...mockAttributeSimple,
                                    id: 'attributeA'
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks: mocksWithFilters});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        expect(screen.getByText('attributeA')).toBeInTheDocument();
        expect(screen.getByText('attributeB')).toBeInTheDocument();
        expect(screen.getByText('attributeC')).toBeInTheDocument();

        await userEvent.type(screen.getByRole('textbox'), 'attributeA{Enter}');
        expect(screen.getByRole('textbox')).toHaveValue('attributeA');

        expect(screen.getByText('attributeA')).toBeInTheDocument();
        expect(screen.queryByText('attributeB')).not.toBeInTheDocument();
        expect(screen.queryByText('attributeC')).not.toBeInTheDocument();
    });

    test('Can sort list', async () => {
        const mocksWithSort = [
            ...baseMocks,
            {
                request: {
                    query: GetAttributesDocument,
                    variables: {pagination: {limit: 20, offset: 0}, sort: {field: 'type', order: 'asc'}, filters: {}}
                },
                result: {
                    data: {
                        attributes: {
                            totalCount: 3,
                            list: [
                                {
                                    ...mockAttributeSimple,
                                    format: 'text',
                                    id: 'attributeA'
                                },
                                {
                                    ...mockAttributeSimple,
                                    format: 'text',
                                    id: 'attributeC'
                                },
                                {
                                    ...mockAttributeSimple,
                                    format: 'numeric',
                                    id: 'attributeB'
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks: mocksWithSort});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        const rows = screen.getAllByRole('row');
        expect(rows[0]).toHaveTextContent('attributeA');
        expect(rows[1]).toHaveTextContent('attributeB');
        expect(rows[2]).toHaveTextContent('attributeC');

        await userEvent.click(screen.getByText('attributes.type'));
        const newRows = screen.getAllByRole('row');
        expect(newRows[0]).toHaveTextContent('attributeA');
        expect(newRows[1]).toHaveTextContent('attributeC');
        expect(newRows[2]).toHaveTextContent('attributeB');
    });

    test('Select elements and submit', async () => {
        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks: baseMocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        userEvent.click(screen.getByText('attributeA'));
        const rows = screen.getAllByRole('row');
        const rowAttributeA = rows[0];
        const rowAttributeB = rows[1];
        const rowAttributeC = rows[2];

        // Select 'attributeA'
        const checkboxAttributeA = within(rowAttributeA).getByRole('checkbox'); // First checkbox is for the table header
        await waitFor(() => expect(checkboxAttributeA).toBeChecked());

        // Unselect 'attributeA'
        userEvent.click(checkboxAttributeA);
        await waitFor(() => expect(checkboxAttributeA).not.toBeChecked());

        // Select "libB" and "libC"
        const checkboxAttributeB = within(rowAttributeB).getByRole('checkbox'); // First checkbox is for the table header
        userEvent.click(checkboxAttributeB);

        const checkboxAttributeC = within(rowAttributeC).getByRole('checkbox'); // First checkbox is for the table header
        userEvent.click(checkboxAttributeC);

        userEvent.click(screen.getByRole('button', {name: /submit/i}));

        await waitFor(() => expect(mockHandleSubmit).toHaveBeenCalledWith(['attributeB', 'attributeC']), {
            timeout: 10000
        });
    });

    test('If not multiple, only one element can be selected', async () => {
        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open multiple={false} />, {
            mocks: baseMocks
        });

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        userEvent.click(screen.getByText('attributeA'));
        const radioBtnAttributeA = within(screen.getByRole('row', {name: /attributeA/i})).getByRole('radio');
        const radioBtnAttributeB = within(screen.getByRole('row', {name: /attributeA/i})).getByRole('radio');
        await waitFor(() => expect(radioBtnAttributeA).toBeChecked());

        userEvent.click(screen.getByText('attributeB'));
        await waitFor(() => expect(radioBtnAttributeB).toBeChecked());
        await waitFor(() => expect(radioBtnAttributeA).not.toBeChecked());
    });

    test('Can create new attribute', async () => {
        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks: baseMocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        const newAttributeButton = screen.queryByRole('button', {name: /new_attribute/i});
        expect(newAttributeButton).toBeInTheDocument();

        await userEvent.click(newAttributeButton);
        expect(screen.getByText('EditAttribute')).toBeInTheDocument();
    });

    test('If not allowed, cannot create new attribute', async () => {
        const mocksNotAllowed = [
            baseMocks[0],
            {
                request: {
                    query: IsAllowedDocument,
                    variables: {
                        type: PermissionTypes.admin,
                        actions: [PermissionsActions.admin_create_attribute]
                    }
                },
                result: {
                    data: {
                        isAllowed: [
                            {
                                name: PermissionsActions.admin_create_attribute,
                                allowed: false
                            }
                        ]
                    }
                }
            }
        ];

        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open showCreateButton={false} />, {
            mocks: mocksNotAllowed
        });

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        expect(screen.queryByRole('button', {name: /new_attribute/i})).not.toBeInTheDocument();
    });
});
