// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {render, screen} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import RecordSummary from './RecordSummary';

let user!: ReturnType<typeof userEvent.setup>;
jest.mock('_ui/components/RecordEdition/EditRecordSidebar/RecordSummary/RecordInformations/RecordInformations', () => ({
    RecordInformations: () => <div>Informations</div>
}));

const useGetRecordValuesQueryMock = jest.fn();
jest.mock('_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery', () => ({
    useGetRecordValuesQuery: () => useGetRecordValuesQueryMock()
}));

describe('RecordSummary', () => {
    beforeEach(() => {
        user = userEvent.setup();
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            data: {},
            refetch: jest.fn()
        });
    });

    afterEach(() => {
        useGetRecordValuesQueryMock.mockClear();
    });

    it('Should display three tabs: informations, chat and history', async () => {
        render(<RecordSummary record={mockRecord} />);

        expect(screen.getByText('record_summary.informations')).toBeInTheDocument();
        expect(screen.getByText('record_summary.chat')).toBeInTheDocument();
        expect(screen.getByText('record_summary.history')).toBeInTheDocument();
    });

    it('Should display loading state', () => {
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: true,
            data: {},
            refetch: jest.fn()
        });

        render(<RecordSummary record={mockRecord} />);

        expect(screen.getByTestId('record-summary-skeleton')).toBeInTheDocument();
    });

    it('Should display error state', () => {
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            error: {message: 'error message'},
            data: {},
            refetch: jest.fn()
        });

        render(<RecordSummary record={mockRecord} />);

        expect(screen.getByText('record_summary.error.title')).toBeVisible();
        expect(screen.getByText('record_summary.error.description')).toBeVisible();
    });

    it('Should refresh on click on refresh button', async () => {
        const refreshMock = jest.fn();
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            error: {message: 'error message'},
            data: {},
            refetch: refreshMock
        });

        render(<RecordSummary record={mockRecord} />);

        await user.click(screen.getByRole('button', {name: 'record_summary.error.refresh'}));
        expect(refreshMock).toHaveBeenCalled();
    });
});
