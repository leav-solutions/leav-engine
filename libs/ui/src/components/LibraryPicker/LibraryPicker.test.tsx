// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {GetLibrariesDocument, IsAllowedDocument, PermissionsActions, PermissionTypes} from '_ui/_gqlTypes';
import {mockLibrarySimple} from '_ui/__mocks__/common/library';
import {render, screen, waitFor, within} from '../../_tests/testUtils';
import LibraryPicker from './LibraryPicker';

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

jest.mock('../EditLibraryModal', () => ({
    EditLibraryModal: () => <div>EditLibrary</div>
}));

jest.mock('../../hooks/useSharedTranslation/useSharedTranslation');

describe('LibraryPicker', () => {
    const mockLibA = {
        __typename: 'Library',
        ...mockLibrarySimple,
        id: 'libA'
    };
    const mockLibB = {
        __typename: 'Library',
        ...mockLibrarySimple,
        id: 'libB'
    };
    const mockLibC = {
        __typename: 'Library',
        ...mockLibrarySimple,
        id: 'libC'
    };

    const mocks = [
        {
            request: {
                query: GetLibrariesDocument,
                variables: {}
            },
            result: {
                data: {
                    libraries: {
                        list: [mockLibA, mockLibB, mockLibC]
                    }
                }
            }
        },
        {
            request: {
                query: IsAllowedDocument,
                variables: {
                    type: PermissionTypes.admin,
                    actions: [PermissionsActions.admin_create_library]
                }
            },
            result: {
                data: {
                    isAllowed: [
                        {
                            name: PermissionsActions.admin_create_library,
                            allowed: true
                        }
                    ]
                }
            }
        }
    ];

    test('Display libraries', async () => {
        const mockHandleSubmit = jest.fn();
        render(<LibraryPicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks});

        await waitFor(() => expect(screen.getByText('libA')).toBeInTheDocument());

        expect(screen.getByText('libA')).toBeInTheDocument();
        expect(screen.getByText('libB')).toBeInTheDocument();
        expect(screen.getByText('libC')).toBeInTheDocument();
    });

    test('Can filter list', async () => {
        const mockHandleSubmit = jest.fn();
        render(<LibraryPicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks});

        await waitFor(() => expect(screen.getByText('libA')).toBeInTheDocument());

        expect(screen.getByText('libA')).toBeInTheDocument();
        expect(screen.getByText('libB')).toBeInTheDocument();
        expect(screen.getByText('libC')).toBeInTheDocument();

        await userEvent.type(screen.getByRole('textbox'), 'libA');
        expect(screen.getByRole('textbox')).toHaveValue('libA');

        expect(screen.getByText('libA')).toBeInTheDocument();
        expect(screen.queryByText('libB')).not.toBeInTheDocument();
        expect(screen.queryByText('libC')).not.toBeInTheDocument();
    });

    test('Select elements and submit', async () => {
        const mockHandleSubmit = jest.fn();
        render(<LibraryPicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks});

        await waitFor(() => expect(screen.getByText('libA')).toBeInTheDocument());

        await userEvent.click(screen.getByText('libA'));

        // Select 'libA'
        const rows = screen.getAllByRole('row');
        const rowLibA = rows[0];
        const rowLibB = rows[1];
        const rowLibC = rows[2];

        const checkboxLibA = within(rowLibA).getByRole('checkbox');
        expect(checkboxLibA).toBeChecked();

        // Unselect 'libA'
        await userEvent.click(checkboxLibA);
        expect(checkboxLibA).not.toBeChecked();

        // Select "libB" and "libC"
        const checkboxLibB = within(rowLibB).getByRole('checkbox');
        await userEvent.click(checkboxLibB);

        const checkboxLibC = within(rowLibC).getByRole('checkbox');
        await userEvent.click(checkboxLibC);

        await userEvent.click(screen.getByRole('button', {name: /submit/i}));

        expect(mockHandleSubmit).toHaveBeenCalledWith([mockLibB, mockLibC]);
    });

    test('If not multiple, only one element can be selected', async () => {
        const mockHandleSubmit = jest.fn();
        render(<LibraryPicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open multiple={false} />, {mocks});

        await waitFor(() => expect(screen.getByText('libA')).toBeInTheDocument());

        await userEvent.click(screen.getByText('libA'));
        const radioBtnLibA = within(screen.getByRole('row', {name: /libA/i})).getByRole('radio');
        const radioBtnLibB = within(screen.getByRole('row', {name: /libB/i})).getByRole('radio');
        expect(radioBtnLibA).toBeChecked();

        await userEvent.click(screen.getByText('libB'));
        expect(radioBtnLibB).toBeChecked();
        expect(radioBtnLibA).not.toBeChecked();
    });

    test('Can create new library', async () => {
        const mockHandleSubmit = jest.fn();
        render(<LibraryPicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks});

        await waitFor(() => expect(screen.getByText('libA')).toBeInTheDocument());

        const newLibButton = screen.queryByRole('button', {name: /new_library/i});
        expect(newLibButton).toBeInTheDocument();

        await userEvent.click(newLibButton);
        expect(screen.getByText('EditLibrary')).toBeInTheDocument();
    });

    test('If not allowed, cannot create new library', async () => {
        const mocksNotAllowed = [
            mocks[0],
            {
                request: {
                    query: IsAllowedDocument,
                    variables: {
                        type: PermissionTypes.admin,
                        actions: [PermissionsActions.admin_create_library]
                    }
                },
                result: {
                    data: {
                        isAllowed: [
                            {
                                name: PermissionsActions.admin_create_library,
                                allowed: false
                            }
                        ]
                    }
                }
            }
        ];

        const mockHandleSubmit = jest.fn();
        render(<LibraryPicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks: mocksNotAllowed});

        await waitFor(() => expect(screen.getByText('libA')).toBeInTheDocument());

        expect(screen.queryByRole('button', {name: /new_library/i})).not.toBeInTheDocument();
    });
});
