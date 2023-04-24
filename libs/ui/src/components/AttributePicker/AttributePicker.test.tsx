// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {GetAttributesDocument} from '../../_gqlTypes';
import {render, screen, waitFor, within} from '../../_tests/testUtils';
import {mockAttributeSimple} from '../../__mocks__/common/attribute';
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

// jest.mock('../EditAttributeModal', () => {
//     return {
//         EditAttributeModal: () => {
//             return <div>EditAttribute</div>;
//         }
//     };
// });

describe('AttributePicker', () => {
    const mocks = [
        {
            request: {
                query: GetAttributesDocument,
                variables: {}
            },
            result: {
                data: {
                    attributes: {
                        list: [
                            {
                                ...mockAttributeSimple,
                                id: 'attributeA'
                            },
                            {
                                ...mockAttributeSimple,
                                id: 'attributeB'
                            },
                            {
                                ...mockAttributeSimple,
                                id: 'attributeC'
                            }
                        ]
                    }
                }
            }
        }
    ];

    test('Display attributes', async () => {
        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        expect(screen.getByText('attributeA')).toBeInTheDocument();
        expect(screen.getByText('attributeB')).toBeInTheDocument();
        expect(screen.getByText('attributeC')).toBeInTheDocument();
    });

    test('Can filter list', async () => {
        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        expect(screen.getByText('attributeA')).toBeInTheDocument();
        expect(screen.getByText('attributeB')).toBeInTheDocument();
        expect(screen.getByText('attributeC')).toBeInTheDocument();

        await userEvent.type(screen.getByRole('textbox'), 'attributeA');
        expect(screen.getByRole('textbox')).toHaveValue('attributeA');

        expect(screen.getByText('attributeA')).toBeInTheDocument();
        expect(screen.queryByText('attributeB')).not.toBeInTheDocument();
        expect(screen.queryByText('attributeC')).not.toBeInTheDocument();
    });

    test('Select elements and submit', async () => {
        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks});

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

        await waitFor(() => expect(mockHandleSubmit).toHaveBeenCalledWith(['attributeB', 'attributeC']));
    });

    test('If not multiple, only one element can be selected', async () => {
        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open multiple={false} />, {mocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        userEvent.click(screen.getByText('attributeA'));
        const radioBtnAttributeA = within(screen.getByRole('row', {name: /attributeA/i})).getByRole('radio');
        const radioBtnAttributeB = within(screen.getByRole('row', {name: /attributeA/i})).getByRole('radio');
        await waitFor(() => expect(radioBtnAttributeA).toBeChecked());

        userEvent.click(screen.getByText('attributeB'));
        await waitFor(() => expect(radioBtnAttributeB).toBeChecked());
        await waitFor(() => expect(radioBtnAttributeA).not.toBeChecked());
    });

    test.skip('Can create new attribute', async () => {
        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open />, {mocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        const newAttributeButton = screen.queryByRole('button', {name: /new_attribute/i});
        expect(newAttributeButton).toBeInTheDocument();

        userEvent.click(newAttributeButton);
        expect(await screen.findByText('EditAttribute')).toBeInTheDocument();
    });

    test.skip('If not allowed, cannot create new attribute', async () => {
        const mockHandleSubmit = jest.fn();
        render(<AttributePicker onClose={jest.fn()} onSubmit={mockHandleSubmit} open canCreate={false} />, {mocks});

        await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

        expect(screen.queryByRole('button', {name: /new_attribute/i})).not.toBeInTheDocument();
    });
});
