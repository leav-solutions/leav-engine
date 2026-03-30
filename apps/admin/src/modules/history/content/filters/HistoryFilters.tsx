// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDivider} from 'aristid-ds';
import {Toolbar} from '../../../ui/toolbar/Toolbar';
import {TotalResult} from './TotalResult';
import {QueryIdFilter} from './filter-item/QueryIdFilter';
import {DateFilter} from './filter-item/DateFilter';
import {ActionFilter} from './filter-item/ActionFilter';
import {UserFilter} from './filter-item/UserFilter';
import {DEFAULT_ACTIONS, DEFAULT_DATES, DEFAULT_QUERY_ID, DEFAULT_USER_ID} from './constants';
import {type OnFilterChange, type HistoryFiltersValues} from './types';

type HistoryFiltersProps = {
    loading: boolean;
    total: number;
    filtersValues: HistoryFiltersValues;
    onFilterChange: OnFilterChange;
};

export const HistoryFilters = ({loading, total, filtersValues, onFilterChange}: HistoryFiltersProps) => (
    <Toolbar
        extraAlignLeft={
            <>
                <TotalResult loading={loading} total={total} />
                <KitDivider type="vertical" />
                <DateFilter
                    loading={loading}
                    value={filtersValues.dates}
                    onChange={value => onFilterChange('dates', value)}
                    onReset={() => onFilterChange('dates', DEFAULT_DATES)}
                />
                <UserFilter
                    loading={loading}
                    value={filtersValues.userId}
                    onChange={value => onFilterChange('userId', value)}
                    onReset={() => onFilterChange('userId', DEFAULT_USER_ID)}
                />
                <ActionFilter
                    loading={loading}
                    value={filtersValues.actions}
                    onChange={value => onFilterChange('actions', value)}
                    onReset={() => onFilterChange('actions', DEFAULT_ACTIONS)}
                />
                <QueryIdFilter
                    loading={loading}
                    value={filtersValues.queryId}
                    onChange={value => onFilterChange('queryId', value)}
                    onReset={() => onFilterChange('queryId', DEFAULT_QUERY_ID)}
                />
            </>
        }
    />
);
