// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {render, screen} from '_ui/_tests/testUtils';
import RecordHistory from './RecordHistory';
import {LogEntry} from './_types';

const useFetchRecordHistoryMock = jest.fn();
jest.mock('./hooks/useFetchRecordHistory', () => ({
    useFetchRecordHistory: (...args) => useFetchRecordHistoryMock(...args)
}));

jest.mock('./RecordHistoryLogEntry', () => ({
    RecordHistoryLogEntry: () => <div data-testid="log-entry">log</div>
}));

jest.mock('./RecordHistoryGoUpButton', () => ({
    RecordHistoryGoUpButton: ({children}) => <div>{children}</div>
}));

jest.mock('../ShowMore', () => ({
    ShowMore: () => <div data-testid="show-more" />
}));

describe('RecordHistory', () => {
    beforeEach(() => {
        useFetchRecordHistoryMock.mockReturnValue({
            loading: false,
            logs: []
        });
    });

    afterEach(() => {
        useFetchRecordHistoryMock.mockClear();
    });

    it('Should fetch record history for a record', async () => {
        render(<RecordHistory record={{id: 'record-1', library: {id: 'lib-1'}}} />);

        expect(useFetchRecordHistoryMock).toHaveBeenCalledWith({
            record: {id: 'record-1', libraryId: 'lib-1'},
            attributeId: undefined
        });
    });

    it('Should fetch record history for a record attribute', async () => {
        render(<RecordHistory record={{id: 'record-1', library: {id: 'lib-1'}}} attributeId="attribute-1" />);

        expect(useFetchRecordHistoryMock).toHaveBeenCalledWith({
            record: {id: 'record-1', libraryId: 'lib-1'},
            attributeId: 'attribute-1'
        });
    });

    it('Should display error state', async () => {
        useFetchRecordHistoryMock.mockReturnValue({
            loading: false,
            inError: true,
            logs: []
        });

        render(<RecordHistory record={{id: 'record-1', library: {id: 'lib-1'}}} />);

        expect(screen.getByText('record_history.error_fetching')).toBeVisible();
    });

    it('Should display empty history message when no log', async () => {
        useFetchRecordHistoryMock.mockReturnValue({
            loading: false,
            logs: []
        });

        render(<RecordHistory record={{id: 'record-1', library: {id: 'lib-1'}}} />);

        expect(screen.getByText('record_history.empty_history')).toBeVisible();
    });

    it('Should display log element without show all history button if only one element', async () => {
        useFetchRecordHistoryMock.mockReturnValue({
            loading: false,
            logs: [
                {
                    action: 'VALUE_SAVE'
                }
            ] as LogEntry[],
            total: 1,
            hasMore: false
        });

        render(<RecordHistory record={{id: 'record-1', library: {id: 'lib-1'}}} />);

        expect(screen.queryAllByTestId('log-entry')).toHaveLength(1);
        expect(screen.queryByText(/record_history\.hide_history/)).toBeNull();
        expect(screen.queryByText(/record_history\.show_history/)).toBeNull();
        expect(screen.queryByTestId('show-more')).toBeNull();
    });

    it('Should display log element with pagination when more than 1', async () => {
        // Simulate third page fetch with only one element
        useFetchRecordHistoryMock.mockReturnValue({
            loading: false,
            logs: [
                {
                    action: 'VALUE_SAVE'
                }
            ] as LogEntry[],
            total: 5,
            hasMore: true
        });

        const {rerender} = render(<RecordHistory record={{id: 'record-1', library: {id: 'lib-1'}}} />);

        const showMoreToggleButton = screen.getByText(/record_history\.show_history/);
        expect(screen.queryAllByTestId('log-entry')).toHaveLength(1);
        expect(showMoreToggleButton).toBeVisible();
        expect(screen.queryByTestId('show-more')).toBeNull();

        // Simulate second page fetch
        useFetchRecordHistoryMock.mockReturnValue({
            loading: false,
            logs: [
                {
                    action: 'VALUE_SAVE'
                },
                {
                    action: 'VALUE_SAVE'
                },
                {
                    action: 'VALUE_SAVE'
                }
            ] as LogEntry[],
            total: 5,
            hasMore: true
        });
        await userEvent.click(showMoreToggleButton);

        expect(screen.queryAllByTestId('log-entry')).toHaveLength(3);
        expect(showMoreToggleButton).toBeVisible();
        showMoreToggleButton.textContent.match(/record_history\.hide_history/);
        expect(screen.getByTestId('show-more')).toBeInTheDocument();

        // Simulate third page fetch
        useFetchRecordHistoryMock.mockReturnValue({
            loading: false,
            logs: [
                {
                    action: 'VALUE_SAVE'
                },
                {
                    action: 'VALUE_SAVE'
                },
                {
                    action: 'VALUE_SAVE'
                },
                {
                    action: 'VALUE_SAVE'
                },
                {
                    action: 'VALUE_SAVE'
                }
            ] as LogEntry[],
            total: 5,
            hasMore: false
        });
        // force rerender to simulate showMore trigger fetchMore !
        rerender(<RecordHistory record={{id: 'record-1', library: {id: 'lib-1'}}} />);

        expect(screen.queryAllByTestId('log-entry')).toHaveLength(5);
        expect(showMoreToggleButton).toBeVisible();
        showMoreToggleButton.textContent.match(/record_history\.hide_history/);

        // Hide logs, keep only first log as in initial state
        await userEvent.click(showMoreToggleButton);

        expect(screen.queryAllByTestId('log-entry')).toHaveLength(1);
        expect(showMoreToggleButton).toBeVisible();
        showMoreToggleButton.textContent.match(/record_history\.show_history/);
    });
});
