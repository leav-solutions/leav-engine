import userEvent from '@testing-library/user-event';
import React from 'react';
import {act, render, screen} from '../../../_tests/testUtils';
import {mockRecord} from '../../../__mocks__/common/records';
import RecordSelector from './RecordSelector';

vi.mock('../../records/SelectRecordModal', () => ({
    default: function SelectRecordModal() {
        return <div>SelectRecordModal</div>;
    },
}));

vi.mock('../../../hooks/useLang');

describe('RecordSelector', () => {
    afterEach(() => vi.clearAllMocks());

    test('Can select a new record', async () => {
        await act(async () => {
            render(<RecordSelector onChange={vi.fn()} value={null} label="icon" libraries={['my_lib']} />);
        });

        const selectBtn = await screen.findByRole('button', {name: /select/});
        expect(selectBtn).toBeInTheDocument();

        await userEvent.click(selectBtn);

        expect(await screen.findByText('SelectRecordModal')).toBeInTheDocument();
    });

    test('Display and change existing record', async () => {
        await act(async () => {
            render(<RecordSelector onChange={vi.fn()} value={mockRecord} label="icon" libraries={['my_lib']} />);
        });

        expect(screen.queryByRole('button', {name: /select/})).not.toBeInTheDocument();
        const recordLabel = screen.getByText(mockRecord.label);
        expect(recordLabel).toBeInTheDocument();

        await userEvent.hover(recordLabel);

        const exchangeBtn = screen.getByRole('button', {name: /exchange/, hidden: true});
        await userEvent.click(exchangeBtn);

        expect(await screen.findByText('SelectRecordModal')).toBeInTheDocument();
    });

    test('Delete existing file', async () => {
        const mockOnChange = vi.fn();
        await act(async () => {
            render(<RecordSelector onChange={mockOnChange} value={mockRecord} label="icon" libraries={['my_lib']} />);
        });

        expect(screen.queryByRole('button', {name: /select/})).not.toBeInTheDocument();
        const recordLabel = screen.getByText(mockRecord.label);
        expect(recordLabel).toBeInTheDocument();

        await userEvent.hover(recordLabel);

        const deleteBtn = screen.getByRole('button', {name: /delete/, hidden: true});
        await userEvent.click(deleteBtn);
        await userEvent.click(await screen.findByText('admin.submit'));

        expect(mockOnChange).toHaveBeenCalled();
    });

    test('If value is required, cannot delete', async () => {
        const mockOnChange = vi.fn();
        await act(async () => {
            render(
                <RecordSelector
                    onChange={mockOnChange}
                    value={mockRecord}
                    label="icon"
                    libraries={['my_lib']}
                    required
                />,
            );
        });

        expect(screen.queryByRole('button', {name: /select/})).not.toBeInTheDocument();
        const recordLabel = screen.getByText(mockRecord.label);
        expect(recordLabel).toBeInTheDocument();

        await userEvent.hover(recordLabel);

        expect(screen.queryByRole('button', {name: /delete/, hidden: true})).not.toBeInTheDocument();
    });
});
