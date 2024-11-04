// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {mockRecord} from '__mocks__/common/records';
import RecordSelector from './RecordSelector';

jest.mock('components/records/SelectRecordModal', () => function SelectRecordModal() {
        return <div>SelectRecordModal</div>;
    });

jest.mock('hooks/useLang');

describe('RecordSelector', () => {
    afterEach(() => jest.clearAllMocks());

    test('Can select a new record', async () => {
        await act(async () => {
            render(<RecordSelector onChange={jest.fn()} value={null} label="icon" libraries={['my_lib']} />);
        });

        const selectBtn = await screen.findByRole('button', {name: /select/});
        expect(selectBtn).toBeInTheDocument();

        userEvent.click(selectBtn);

        expect(screen.getByText('SelectRecordModal')).toBeInTheDocument();
    });

    test('Display and change existing record', async () => {
        await act(async () => {
            render(<RecordSelector onChange={jest.fn()} value={mockRecord} label="icon" libraries={['my_lib']} />);
        });

        expect(screen.queryByRole('button', {name: /select/})).not.toBeInTheDocument();
        const recordLabel = screen.getByText(mockRecord.label);
        expect(recordLabel).toBeInTheDocument();

        userEvent.hover(recordLabel);

        const exchangeBtn = screen.getByRole('button', {name: /exchange/, hidden: true});
        userEvent.click(exchangeBtn);

        expect(screen.getByText('SelectRecordModal')).toBeInTheDocument();
    });

    test('Delete existing file', async () => {
        const mockOnChange = jest.fn();
        await act(async () => {
            render(<RecordSelector onChange={mockOnChange} value={mockRecord} label="icon" libraries={['my_lib']} />);
        });

        expect(screen.queryByRole('button', {name: /select/})).not.toBeInTheDocument();
        const recordLabel = screen.getByText(mockRecord.label);
        expect(recordLabel).toBeInTheDocument();

        userEvent.hover(recordLabel);

        const deleteBtn = screen.getByRole('button', {name: /delete/, hidden: true});
        userEvent.click(deleteBtn);
        userEvent.click(screen.getByRole('button', {name: /submit/}));

        expect(mockOnChange).toBeCalled();
    });

    test('If value is required, cannot delete', async () => {
        const mockOnChange = jest.fn();
        await act(async () => {
            render(
                <RecordSelector
                    onChange={mockOnChange}
                    value={mockRecord}
                    label="icon"
                    libraries={['my_lib']}
                    required
                />
            );
        });

        expect(screen.queryByRole('button', {name: /select/})).not.toBeInTheDocument();
        const recordLabel = screen.getByText(mockRecord.label);
        expect(recordLabel).toBeInTheDocument();

        userEvent.hover(recordLabel);

        expect(screen.queryByRole('button', {name: /delete/, hidden: true})).not.toBeInTheDocument();
    });
});
