import userEvent from '@testing-library/user-event';
import {render, screen} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import RecordSummary from './RecordSummary';

let user!: ReturnType<typeof userEvent.setup>;
vi.mock('_ui/components/RecordEdition/EditRecordSidebar/RecordSummary/RecordInformations/RecordInformations', () => ({
    RecordInformations: () => <div>Informations</div>,
}));

const useGetRecordValuesQueryMock = vi.fn();
vi.mock('_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery', () => ({
    useGetRecordValuesQuery: () => useGetRecordValuesQueryMock(),
}));

vi.mock('_ui/components/RecordHistory/hooks/useFetchRecordHistory', () => ({
    useFetchRecordHistory: () => ({
        loading: false,
        inError: false,
        logs: [],
        total: 0,
        hasMore: false,
        fetchMore: vi.fn(),
    }),
}));

describe('RecordSummary', () => {
    beforeEach(() => {
        user = userEvent.setup();
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            data: {},
            refetch: vi.fn(),
        });
    });

    afterEach(() => {
        useGetRecordValuesQueryMock.mockClear();
    });

    it('Should display sections informations and history', async () => {
        render(<RecordSummary record={mockRecord} />);

        expect(screen.getByText('record_summary.informations')).toBeInTheDocument();
        expect(screen.getByText('record_summary.history')).toBeInTheDocument();
    });

    it('Should display loading state', () => {
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: true,
            data: {},
            refetch: vi.fn(),
        });

        render(<RecordSummary record={mockRecord} />);

        expect(screen.getByTestId('record-summary-skeleton')).toBeInTheDocument();
    });

    it('Should display error state', () => {
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            error: {message: 'error message'},
            data: {},
            refetch: vi.fn(),
        });

        render(<RecordSummary record={mockRecord} />);

        expect(screen.getByText('record_summary.error.title')).toBeVisible();
        expect(screen.getByText('record_summary.error.description')).toBeVisible();
    });

    it('Should refresh on click on refresh button', async () => {
        const refreshMock = vi.fn();
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            error: {message: 'error message'},
            data: {},
            refetch: refreshMock,
        });

        render(<RecordSummary record={mockRecord} />);

        await user.click(screen.getByRole('button', {name: 'record_summary.error.refresh'}));
        expect(refreshMock).toHaveBeenCalled();
    });
});
