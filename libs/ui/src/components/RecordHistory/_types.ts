import {type RecordHistoryLogEntryFragment} from '_ui/_gqlTypes';

export type LogEntry = RecordHistoryLogEntryFragment;
export type LogEntryValue = Extract<LogEntry, {before?: any; after?: any}>;
export type LogEntryAttribute = NonNullable<NonNullable<LogEntryValue['topic']>['attribute']>;
export type LogEntryData = LogEntryValue['before'] | LogEntryValue['after'];
