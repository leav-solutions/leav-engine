// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordHistoryLogAttributeFragment, RecordHistoryLogEntryFragment} from '_ui/_gqlTypes';

export type LogEntry = RecordHistoryLogEntryFragment;
export type LogEntryValue = Extract<LogEntry, {before?: any; after?: any}>;
export type LogEntryAttribute = RecordHistoryLogAttributeFragment;
export type LogEntryData = LogEntryValue['before'] | LogEntryValue['after'];
