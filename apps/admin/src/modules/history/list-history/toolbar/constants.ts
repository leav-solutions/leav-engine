// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import dayjs from 'dayjs';
import {type LogAction} from '../../../../_gqlTypes';
import {type DateFilterValue} from './types';

export const DEFAULT_DATES: DateFilterValue = {
    label: 'logs.filters.date.today',
    from: dayjs().startOf('day').unix(),
    to: dayjs().endOf('day').unix(),
};

export const DEFAULT_QUERY_ID: string | null = null;

export const DEFAULT_ACTIONS: LogAction[] = [];

export const DEFAULT_USER_ID: string | null = null;

export const DEBOUNCE_DELAY_MS = 300;
