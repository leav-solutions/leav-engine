// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type LogAction} from '../../../../_gqlTypes';

export type DateFilterValue = {
    from: number;
    to: number;
    label: string;
};

export type HistoryFiltersValues = {
    dates: DateFilterValue;
    queryId: string | null;
    actions: LogAction[];
    userId: string | null;
};

export type OnFilterChange = <FilterKey extends keyof HistoryFiltersValues>(
    key: FilterKey,
    value: HistoryFiltersValues[FilterKey],
) => void;
