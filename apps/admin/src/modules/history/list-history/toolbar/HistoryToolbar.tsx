// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDivider} from 'aristid-ds';
import {Toolbar} from '../../../ui/toolbar/Toolbar';
import {TotalResult} from '../../../ui/toolbar/total-result/TotalResult';
import {QueryIdFilter} from './filter/filter-item/QueryIdFilter';
import {DateFilter} from './filter/filter-item/DateFilter';
import {ActionFilter} from './filter/filter-item/ActionFilter';
import {UserFilter} from './filter/filter-item/UserFilter';
import {DEFAULT_ACTIONS, DEFAULT_DATES, DEFAULT_QUERY_ID, DEFAULT_USER_ID} from './constants';
import {type OnFilterChange, type HistoryFiltersValues} from './types';
import {RefreshButton} from './refresh-button/RefreshButton';
import {ResetButton} from './filter/reset-button/ResetButton';

type HistoryToolbarProps = {
    loading: boolean;
    total: number;
    filtersValues: HistoryFiltersValues;
    onFilterChange: OnFilterChange;
    onRefresh: () => void;
    onFilterReset: () => void;
};

export const HistoryToolbar = ({
    loading,
    total,
    filtersValues,
    onFilterChange,
    onRefresh,
    onFilterReset,
}: HistoryToolbarProps) => (
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
                <ResetButton loading={loading} onReset={onFilterReset} />
            </>
        }
        extraAlignRight={<RefreshButton loading={loading} onRefresh={onRefresh} />}
    />
);
