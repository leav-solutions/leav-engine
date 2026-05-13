import {useState} from 'react';
import {type LogFilterInput} from '../../../../../_gqlTypes';
import {type OnFilterChange, type HistoryFiltersValues} from '../types';
import {DEFAULT_ACTIONS, DEFAULT_DATES, DEFAULT_QUERY_ID, DEFAULT_USER_ID} from '../constants';

type UseHistoryFiltersParams = {
    onFilterChange: () => void;
};

const DEFAULT_FILTERS_VALUES: HistoryFiltersValues = {
    dates: DEFAULT_DATES,
    queryId: DEFAULT_QUERY_ID,
    actions: DEFAULT_ACTIONS,
    userId: DEFAULT_USER_ID,
};

export const useHistoryFilters = ({onFilterChange: onFilterChangeCallback}: UseHistoryFiltersParams) => {
    const [filtersValues, setFiltersValues] = useState<HistoryFiltersValues>({
        ...DEFAULT_FILTERS_VALUES,
    });

    const gqlFilters: LogFilterInput = {
        time: {from: filtersValues.dates.from, to: filtersValues.dates.to},
        ...(filtersValues.queryId ? {queryId: filtersValues.queryId} : {}),
        ...(filtersValues.actions.length ? {actions: filtersValues.actions} : {}),
        ...(filtersValues.userId ? {userId: filtersValues.userId} : {}),
    };

    const onFilterChange: OnFilterChange = (key, value) => {
        setFiltersValues(prev => ({...prev, [key]: value}));
        onFilterChangeCallback();
    };

    const onFilterReset = () => {
        setFiltersValues({...DEFAULT_FILTERS_VALUES});
        onFilterChangeCallback();
    };

    return {
        gqlFilters,
        filtersValues,
        onFilterChange,
        onFilterReset,
    };
};
