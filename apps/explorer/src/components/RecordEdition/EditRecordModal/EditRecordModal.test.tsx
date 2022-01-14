// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IUseCanEditRecordHook} from 'hooks/useCanEditRecord/useCanEditRecord';
import React from 'react';
import {act, fireEvent, render, screen, waitForElement} from '_tests/testUtils';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import EditRecordModal from './EditRecordModal';

jest.mock('../EditRecord', () => {
    return function EditRecord() {
        return <div>EditRecord</div>;
    };
});

jest.mock('hooks/useCanEditRecord/useCanEditRecord', () => ({
    useCanEditRecord: (): IUseCanEditRecordHook => ({loading: false, canEdit: true, isReadOnly: false})
}));

describe('EditRecordModal', () => {
    test('Display modal', async () => {
        const _handleClose = jest.fn();

        await act(async () => {
            render(
                <EditRecordModal
                    library={mockRecordWhoAmI.library.id}
                    record={mockRecordWhoAmI}
                    open
                    onClose={_handleClose}
                />
            );
        });

        expect(screen.getByRole('dialog')).toBeVisible();
        expect(screen.getAllByText('record_label')[0]).toBeVisible();
        expect(screen.getByText('EditRecord')).toBeVisible();
    });

    test('Close modal', async () => {
        const _handleClose = jest.fn();

        await act(async () => {
            render(
                <EditRecordModal
                    library={mockRecordWhoAmI.library.id}
                    record={mockRecordWhoAmI}
                    open
                    onClose={_handleClose}
                />
            );
        });

        fireEvent.click(screen.getByRole('button', {name: 'global.close'}));

        expect(_handleClose).toBeCalled();
    });

    describe('Creation mode', () => {
        test('Open modal in creation mode', async () => {
            const _handleClose = jest.fn();

            await act(async () => {
                render(
                    <EditRecordModal library={mockRecordWhoAmI.library.id} record={null} open onClose={_handleClose} />
                );
            });

            await waitForElement(() => screen.getByText('EditRecord'));

            expect(screen.getByText(/new_record/)).toBeVisible();
            expect(screen.getByText('EditRecord')).toBeVisible();
            expect(screen.getByRole('button', {name: /submit/})).toBeInTheDocument();
        });
    });
});
