import {Toolbar} from '../../../ui/toolbar/Toolbar';
import {TotalResult} from '../../../ui/toolbar/total-result/TotalResult';
import {CreateButton} from './create-button/CreateButton';

type AutomationToolbarProps = {
    loading: boolean;
    total: number;
    // filtersValues: HistoryFiltersValues;
    // onFilterChange: OnFilterChange;
};

export const AutomationToolbar = ({
    loading,
    total,
    // filtersValues,
    // onFilterChange,
}: AutomationToolbarProps) => (
    <Toolbar
        extraAlignLeft={
            <>
                <TotalResult loading={loading} total={total} />
                {/* <KitDivider type="vertical" /> */}
                {/** TODO: Add filters here */}
            </>
        }
        extraAlignRight={
            <>
                {/* TODO: Add more buttons here (search, filters, etc.) */}
                <CreateButton />
            </>
        }
    />
);
