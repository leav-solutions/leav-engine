// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {type LogFilterInput} from '../../../../../_gqlTypes';
import {type OnFilterChange, type HistoryFiltersValues} from '../types';
import {DEFAULT_ACTIONS, DEFAULT_DATES, DEFAULT_QUERY_ID, DEFAULT_USER_ID} from '../constants';

type UseHistoryFiltersParams = {
    onFilterChange: () => void;
};

export const useHistoryFilters = ({onFilterChange: onFilterChangeCallback}: UseHistoryFiltersParams) => {
    const [filtersValues, setFiltersValues] = useState<HistoryFiltersValues>({
        dates: DEFAULT_DATES,
        queryId: DEFAULT_QUERY_ID,
        actions: DEFAULT_ACTIONS,
        userId: DEFAULT_USER_ID,
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

    return {
        gqlFilters,
        filtersValues,
        onFilterChange,
    };
};
