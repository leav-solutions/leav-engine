import {
    type AutomationRulesFiltersInput,
    AutomationRuleSortableFields,
    SortOrder,
    useGetAutomationRulesDataQuery,
} from '../../../../_gqlTypes';
import {mapAutomationRulesData} from './mapAutomationRulesData';

export type AutomationRulesData = {
    id: string;
    name: string;
    version: string;
    trigger: string;
    target: string;
    nb_actions: number;
    active: boolean;
    modifiedAt: string;
    modifiedBy: string;
};

export type UseGetAutomationRulesParams = {
    currentPage: number;
    pageSize: number;
    filters?: AutomationRulesFiltersInput;
};

export const useGetAutomationRulesData = ({currentPage, pageSize, filters}: UseGetAutomationRulesParams) => {
    const {data, loading, error, refetch} = useGetAutomationRulesDataQuery({
        fetchPolicy: 'no-cache',
        variables: {
            filters,
            sort: {
                field: AutomationRuleSortableFields.active,
                order: SortOrder.desc,
            },
            pagination: {
                limit: pageSize,
                offset: (currentPage - 1) * pageSize,
            },
        },
    });

    if (loading || error || !data) {
        return {
            data: [],
            total: 0,
            loading,
            error,
            refetch,
        };
    }

    return {
        data: mapAutomationRulesData(data?.automationRules) ?? [],
        total: data.automationRules?.totalCount ?? 0,
        loading,
        error,
        refetch,
    };
};
