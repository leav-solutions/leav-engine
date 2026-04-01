// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Toolbar} from '../../../ui/toolbar/Toolbar';
import {TotalResult} from '../../../ui/toolbar/total-result/TotalResult';

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
        // extraAlignRight={
        //TODO: Add create button here (and maybe more buttons if needed)
        // }
    />
);
