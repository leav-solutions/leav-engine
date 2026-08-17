import {KitDivider} from 'aristid-ds';
import {Toolbar} from '../../../ui/toolbar/Toolbar';
import {TotalResult} from '../../../ui/toolbar/total-result/TotalResult';
import {FiltersResetButton} from '../../../ui/filter/FiltersResetButton';
import {CreateButton} from './create-button/CreateButton';
import {LibraryFilter} from './filter/filter-item/LibraryFilter';
import {AttributeFilter} from './filter/filter-item/AttributeFilter';
import {TriggerTypeFilter} from './filter/filter-item/TriggerTypeFilter';
import {StatusFilter} from './filter/filter-item/StatusFilter';
import {ExecutionModeFilter} from './filter/filter-item/ExecutionModeFilter';
import {VersionFilter} from './filter/filter-item/VersionFilter';
import {type AutomationFiltersValues, type OnAutomationFilterChange} from './filter/types';

type AutomationToolbarProps = {
    loading: boolean;
    total: number;
    filtersValues: AutomationFiltersValues;
    onFilterChange: OnAutomationFilterChange;
    onFilterReset: () => void;
};

export const AutomationToolbar = ({
    loading,
    total,
    filtersValues,
    onFilterChange,
    onFilterReset,
}: AutomationToolbarProps) => (
    <Toolbar
        extraAlignLeft={
            <>
                <TotalResult loading={loading} total={total} />
                <KitDivider orientation="vertical" />
                <LibraryFilter
                    loading={loading}
                    value={filtersValues.library}
                    onChange={value => onFilterChange('library', value)}
                    onReset={() => onFilterChange('library', null)}
                />
                <AttributeFilter
                    loading={loading}
                    library={filtersValues.library}
                    value={filtersValues.attribute}
                    onChange={value => onFilterChange('attribute', value)}
                    onReset={() => onFilterChange('attribute', null)}
                />
                <TriggerTypeFilter
                    loading={loading}
                    value={filtersValues.eventAction}
                    onChange={value => onFilterChange('eventAction', value)}
                    onReset={() => onFilterChange('eventAction', null)}
                />
                <StatusFilter
                    loading={loading}
                    value={filtersValues.active}
                    onChange={value => onFilterChange('active', value)}
                    onReset={() => onFilterChange('active', null)}
                />
                <ExecutionModeFilter
                    loading={loading}
                    value={filtersValues.synchronous}
                    onChange={value => onFilterChange('synchronous', value)}
                    onReset={() => onFilterChange('synchronous', null)}
                />
                <VersionFilter
                    loading={loading}
                    value={filtersValues.version}
                    onChange={value => onFilterChange('version', value)}
                    onReset={() => onFilterChange('version', null)}
                />
                <FiltersResetButton loading={loading} onReset={onFilterReset} />
            </>
        }
        extraAlignRight={
            <>
                {/* TODO: Add more buttons here (search, etc.) */}
                <CreateButton />
            </>
        }
    />
);
