// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {fireEvent, render, screen} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import EditRecordBtn from './EditRecordBtn';

jest.mock('../EditRecordModal', () => ({
    EditRecordModal: () => <div>EditRecordModal</div>
}));

describe('EditRecordBtn', () => {
    test('Display button', async () => {
        render(<EditRecordBtn record={mockRecord} size="small" />);

        expect(screen.getByRole('button', {name: 'edit-record'})).toBeInTheDocument();
    });

    test('Open modal on click', async () => {
        render(<EditRecordBtn record={mockRecord} size="small" />);

        const btn = screen.getByRole('button', {name: 'edit-record'});

        fireEvent.click(btn);

        expect(screen.getByText('EditRecordModal')).toBeVisible();
    });
});
