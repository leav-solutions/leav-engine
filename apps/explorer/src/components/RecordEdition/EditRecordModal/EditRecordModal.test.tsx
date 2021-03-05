// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import EditRecordModal from './EditRecordModal';

jest.mock('../EditRecord', () => {
    return function EditRecord() {
        return <div>EditRecord</div>;
    };
});

describe('EditRecordModal', () => {
    test('Display modal', async () => {
        const _handleClose = jest.fn();

        render(<EditRecordModal record={mockRecordWhoAmI} open onClose={_handleClose} />);

        expect(screen.getByRole('dialog')).toBeVisible();
        expect(screen.getByText('record_label')).toBeVisible();
        expect(screen.getByText('EditRecord')).toBeVisible();
    });

    test('Close modal', async () => {
        const _handleClose = jest.fn();

        render(<EditRecordModal record={mockRecordWhoAmI} open onClose={_handleClose} />);

        fireEvent.click(screen.getByRole('button', {name: 'global.close'}));

        expect(_handleClose).toBeCalled();
    });
});
