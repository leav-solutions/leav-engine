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
