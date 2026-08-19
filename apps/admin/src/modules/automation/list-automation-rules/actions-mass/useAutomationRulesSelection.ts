import {useCallback, useEffect, useState} from 'react';
import {type AutomationRulesFiltersInput, useGetAutomationRulesDataLazyQuery} from '../../../../_gqlTypes';
import {mapAutomationRulesData} from '../get-automation-rules-data/mapAutomationRulesData';
import {type AutomationRulesData} from '../get-automation-rules-data/useGetAutomationRulesData';

type UseAutomationRulesSelectionParams = {
    total: number;
    pageSize: number;
    filters?: AutomationRulesFiltersInput;
    visibleRules: AutomationRulesData[];
};

export const useAutomationRulesSelection = ({
    total,
    pageSize,
    filters,
    visibleRules,
}: UseAutomationRulesSelectionParams) => {
    const [selectedRules, setSelectedRules] = useState<AutomationRulesData[]>([]);
    const [isAllFilteredSelected, setIsAllFilteredSelected] = useState(false);
    const [fetchAllRules, {loading: isSelectingAll}] = useGetAutomationRulesDataLazyQuery({fetchPolicy: 'no-cache'});

    const clearSelection = useCallback(() => {
        setSelectedRules([]);
        setIsAllFilteredSelected(false);
    }, []);

    const selectRules = useCallback((rules: AutomationRulesData[]) => {
        setSelectedRules(rules);
        setIsAllFilteredSelected(false);
    }, []);

    const selectAllFiltered = useCallback(async () => {
        // Everything already fits on the current page: no extra round-trip, and the row checkboxes
        // can stay interactive.
        if (total <= pageSize) {
            setSelectedRules(visibleRules);
            setIsAllFilteredSelected(false);
            return;
        }

        const {data} = await fetchAllRules({variables: {filters, pagination: {limit: total, offset: 0}}});

        setSelectedRules(mapAutomationRulesData(data?.automationRules) ?? []);
        setIsAllFilteredSelected(true);
    }, [total, pageSize, visibleRules, filters, fetchAllRules]);

    // A page/pageSize change must not clear the selection: `preserveSelectedRowKeys` on the table's
    // `rowSelection` (see AutomationTable) keeps antd from truncating it when navigating pages.
    // A filter change, however, can make previously selected rows fall out of the result set
    // entirely, so the selection is no longer meaningful and must be reset.
    // `filters` is rebuilt on every render by useAutomationFilters, hence the serialized dependency.
    const filtersKey = JSON.stringify(filters ?? null);
    useEffect(() => {
        clearSelection();
    }, [filtersKey, clearSelection]);

    return {
        selectedRules,
        selectedRuleIds: selectedRules.map(({id}) => id),
        isAllFilteredSelected,
        isSelectingAll,
        selectRules,
        selectAllFiltered,
        clearSelection,
    };
};
