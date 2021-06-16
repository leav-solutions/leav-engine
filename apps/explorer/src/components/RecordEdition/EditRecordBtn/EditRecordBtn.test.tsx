// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import EditRecordBtn from './EditRecordBtn';

jest.mock('../EditRecordModal', () => {
    return function EditRecordModal() {
        return <div>EditRecordModal</div>;
    };
});

describe('EditRecordBtn', () => {
    test('Display button', async () => {
        render(<EditRecordBtn record={mockRecordWhoAmI} size="small" />);

        expect(screen.getByRole('button', {name: 'edit-record'})).toBeInTheDocument();
    });

    test('Open modal on click', async () => {
        render(<EditRecordBtn record={mockRecordWhoAmI} size="small" />);

        const btn = screen.getByRole('button', {name: 'edit-record'});

        fireEvent.click(btn);

        expect(screen.getByText('EditRecordModal')).toBeVisible();
    });
});
