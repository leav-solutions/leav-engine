// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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

    it('Should display log element if any', async () => {
        useFetchRecordHistoryMock.mockReturnValue({
            loading: false,
            logs: [
                {
                    action: 'VALUE_SAVE'
                },
                {
                    action: 'VALUE_SAVE'
                }
            ] as LogEntry[]
        });

        render(<RecordHistory record={{id: 'record-1', library: {id: 'lib-1'}}} />);

        expect(screen.queryAllByTestId('log-entry')).toHaveLength(2);
    });
});
