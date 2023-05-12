// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {GetTreesDocument, IsAllowedDocument, PermissionsActions, PermissionTypes} from '../../_gqlTypes';
import {render, screen, waitFor, within} from '../../_tests/testUtils';
import {mockTreeSimple} from '../../__mocks__/common/tree';
import TreePicker from './TreePicker';

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

jest.mock('../EditTreeModal', () => {
    return {
        EditTreeModal: () => {
            return <div>EditTree</div>;
        }
    };
});

describe('TreePicker', () => {
    const mockTreeA = {
        __typename: 'Tree',
        ...mockTreeSimple,
        id: 'treeA'
    };
    const mockTreeB = {
        __typename: 'Tree',
        ...mockTreeSimple,
        id: 'treeB'
    };
    const mockTreeC = {
        __typename: 'Tree',
        ...mockTreeSimple,
        id: 'treeC'
    };

    const mocks = [
        {
            request: {
                query: GetTreesDocument,
                variables: {}
            },
            result: {
                data: {
                    trees: {
                        list: [mockTreeA, mockTreeB, mockTreeC]
                    }
                }
            }
        },
        {
            request: {
                query: IsAllowedDocument,
                variables: {
                    type: PermissionTypes.admin,
                    actions: [PermissionsActions.admin_create_tree]
                }
            },
            result: {
                data: {
                    isAllowed: [
                        {
                            name: PermissionsActions.admin_create_tree,
                            allowed: true
                        }
                    ]
                }
            }
        }
    ];

    test('Display trees', async () => {
        const mockHandleSubmit = jest.fn();
        render(<TreePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        expect(screen.getByText('treeA')).toBeInTheDocument();
        expect(screen.getByText('treeB')).toBeInTheDocument();
        expect(screen.getByText('treeC')).toBeInTheDocument();
    });

    test('Can filter list', async () => {
        const mockHandleSubmit = jest.fn();
        render(<TreePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        expect(screen.getByText('treeA')).toBeInTheDocument();
        expect(screen.getByText('treeB')).toBeInTheDocument();
        expect(screen.getByText('treeC')).toBeInTheDocument();

        await userEvent.type(screen.getByRole('textbox'), 'treeA');
        expect(screen.getByRole('textbox')).toHaveValue('treeA');

        expect(screen.getByText('treeA')).toBeInTheDocument();
        expect(screen.queryByText('treeB')).not.toBeInTheDocument();
        expect(screen.queryByText('treeC')).not.toBeInTheDocument();
    });

    test('Select elements and submit', async () => {
        const mockHandleSubmit = jest.fn();
        render(<TreePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        userEvent.click(screen.getByText('treeA'));
        const rows = screen.getAllByRole('row');
        const rowAttributeA = rows[0];
        const rowAttributeB = rows[1];
        const rowAttributeC = rows[2];

        // Select 'treeA'
        const checkboxAttributeA = within(rowAttributeA).getByRole('checkbox'); // First checkbox is for the table header
        await waitFor(() => expect(checkboxAttributeA).toBeChecked());

        // Unselect 'treeA'
        userEvent.click(checkboxAttributeA);
        await waitFor(() => expect(checkboxAttributeA).not.toBeChecked());

        // Select "treeB" and "treeC"
        const checkboxAttributeB = within(rowAttributeB).getByRole('checkbox'); // First checkbox is for the table header
        userEvent.click(checkboxAttributeB);

        const checkboxAttributeC = within(rowAttributeC).getByRole('checkbox'); // First checkbox is for the table header
        userEvent.click(checkboxAttributeC);

        userEvent.click(screen.getByRole('button', {name: /submit/i}));

        await waitFor(() => expect(mockHandleSubmit).toHaveBeenCalledWith([mockTreeB, mockTreeC]));
    });

    test('If not multiple, only one element can be selected', async () => {
        const mockHandleSubmit = jest.fn();
        render(<TreePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open multiple={false} />, {mocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        userEvent.click(screen.getByText('treeA'));
        const radioBtnAttributeA = within(screen.getByRole('row', {name: /treeA/i})).getByRole('radio');
        const radioBtnAttributeB = within(screen.getByRole('row', {name: /treeA/i})).getByRole('radio');
        await waitFor(() => expect(radioBtnAttributeA).toBeChecked());

        userEvent.click(screen.getByText('treeB'));
        await waitFor(() => expect(radioBtnAttributeB).toBeChecked());
        await waitFor(() => expect(radioBtnAttributeA).not.toBeChecked());
    });

    test('Can create new tree', async () => {
        const mockHandleSubmit = jest.fn();
        render(<TreePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        const newTreeButton = screen.queryByRole('button', {name: /new_tree/i});
        expect(newTreeButton).toBeInTheDocument();

        userEvent.click(newTreeButton);
        expect(await screen.findByText('EditTree')).toBeInTheDocument();
    });

    test('If not allowed, cannot create new tree', async () => {
        const mocksNotAllowed = [
            mocks[0],
            {
                request: {
                    query: IsAllowedDocument,
                    variables: {
                        type: PermissionTypes.admin,
                        actions: [PermissionsActions.admin_create_tree]
                    }
                },
                result: {
                    data: {
                        isAllowed: [
                            {
                                name: PermissionsActions.admin_create_tree,
                                allowed: false
                            }
                        ]
                    }
                }
            }
        ];

        const mockHandleSubmit = jest.fn();
        render(<TreePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {
            mocks: mocksNotAllowed
        });

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        expect(screen.queryByRole('button', {name: /new_tree/i})).not.toBeInTheDocument();
    });
});
