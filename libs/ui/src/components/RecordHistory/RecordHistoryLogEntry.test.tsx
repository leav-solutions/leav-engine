// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import RecordHistoryLogEntry from './RecordHistoryLogEntry';
import {AttributeFormat, AttributeType, LogAction} from '_ui/_gqlTypes';
import {type LogEntry, type LogEntryAttribute} from './_types';

describe('RecordHistoryLogEntry', () => {
    const buildLogEntry = (attribute?: LogEntryAttribute, before?: string, after?: string): LogEntry => ({
        action: LogAction.VALUE_SAVE,
        time: 1672531199, // corresponds to 31/12/2022 @ 11:59pm (UTC)
        user: {
            id: 'user-1',
            whoAmI: {id: 'user-1', library: {id: 'user'}},
            properties: [
                {
                    attributeId: 'email',
                    values: [
                        {
                            payload: 'test@example.com'
                        }
                    ]
                }
            ]
        },
        topic: {
            attribute
        },
        before: before ? {asString: before} : null,
        after: after ? {asString: after} : null
    });

    it('Should display user, attribute, date without before and after', async () => {
        render(
            <RecordHistoryLogEntry
                index={0}
                logEntry={buildLogEntry({
                    id: 'attr-1',
                    label: {en: 'Attribute 1'},
                    type: AttributeType.simple,
                    format: AttributeFormat.text,
                    multiple_values: false
                })}
            />
        );

        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('Attribute 1')).toBeInTheDocument();
        expect(screen.getByText('record_history.action.value_modify')).toBeInTheDocument();
        expect(screen.getByText(/\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2}/)).toBeInTheDocument(); // date DD/MM/YYYY HH:mm:ss
    });

    it('Should display with before and after for mono value attribute', async () => {
        render(
            <RecordHistoryLogEntry
                index={0}
                logEntry={buildLogEntry(
                    {
                        id: 'attr-1',
                        label: {en: 'Attribute 1'},
                        type: AttributeType.simple,
                        format: AttributeFormat.text,
                        multiple_values: false
                    },
                    'before value',
                    'after value'
                )}
            />
        );

        expect(screen.getByText('record_history.action.value_modify')).toBeInTheDocument();
        expect(screen.getByText('before value')).toBeInTheDocument();
        expect(screen.getByText('after value')).toBeInTheDocument();
    });

    it('Should display with before only for mono value attribute', async () => {
        render(
            <RecordHistoryLogEntry
                index={0}
                logEntry={{
                    ...buildLogEntry(
                        {
                            id: 'attr-1',
                            label: {en: 'Attribute 1'},
                            type: AttributeType.simple,
                            format: AttributeFormat.text,
                            multiple_values: false
                        },
                        'before value'
                    ),
                    action: LogAction.VALUE_DELETE
                }}
            />
        );

        expect(screen.getByText('record_history.action.value_modify')).toBeInTheDocument();
        expect(screen.getByText('before value')).toBeInTheDocument();
        expect(screen.getByText(/record_history\.no_value/)).toBeInTheDocument();
    });

    it('Should display with after only for mono value attribute', async () => {
        render(
            <RecordHistoryLogEntry
                index={0}
                logEntry={buildLogEntry(
                    {
                        id: 'attr-1',
                        label: {en: 'Attribute 1'},
                        type: AttributeType.simple,
                        format: AttributeFormat.text,
                        multiple_values: false
                    },
                    undefined,
                    'after value'
                )}
            />
        );

        expect(screen.getByText('record_history.action.value_modify')).toBeInTheDocument();
        expect(screen.getByText(/record_history\.no_value/)).toBeInTheDocument();
        expect(screen.getByText('after value')).toBeInTheDocument();
    });

    it('Should display with after only for multi value attribute', async () => {
        render(
            <RecordHistoryLogEntry
                index={0}
                logEntry={buildLogEntry(
                    {
                        id: 'attr-1',
                        label: {en: 'Attribute 1'},
                        type: AttributeType.advanced,
                        format: AttributeFormat.text,
                        multiple_values: true
                    },
                    undefined,
                    'after value'
                )}
            />
        );

        expect(screen.getByText('record_history.action.value_add')).toBeInTheDocument();
        expect(screen.getByText('after value')).toBeInTheDocument();
    });

    it('Should display with before only for multi value attribute', async () => {
        render(
            <RecordHistoryLogEntry
                index={0}
                logEntry={{
                    ...buildLogEntry(
                        {
                            id: 'attr-1',
                            label: {en: 'Attribute 1'},
                            type: AttributeType.advanced,
                            format: AttributeFormat.text,
                            multiple_values: true
                        },
                        'before value'
                    ),
                    action: LogAction.VALUE_DELETE
                }}
            />
        );

        expect(screen.getByText('record_history.action.value_delete')).toBeInTheDocument();
        expect(screen.getByText('before value')).toBeInTheDocument();
    });

    it('Should display fallback for unknown user', async () => {
        render(
            <RecordHistoryLogEntry
                index={0}
                logEntry={{
                    ...buildLogEntry({
                        id: 'attr-1',
                        label: {en: 'Attribute 1'},
                        type: AttributeType.simple,
                        format: AttributeFormat.text,
                        multiple_values: false
                    }),
                    user: null
                }}
            />
        );

        expect(screen.getByText(/record_history\.unknown_user/)).toBeInTheDocument();
        expect(screen.getByText('Attribute 1')).toBeInTheDocument();
        expect(screen.getByText(/record_history\.action\.value_modify/)).toBeInTheDocument();
    });

    it('Should display fallback for unknown attribute', async () => {
        render(<RecordHistoryLogEntry index={0} logEntry={buildLogEntry()} />);

        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('record_history.unknown_attribute')).toBeInTheDocument();
        expect(screen.getByText('record_history.action.value_modify')).toBeInTheDocument();
    });
});
