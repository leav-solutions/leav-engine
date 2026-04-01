// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type AutomationRulesFiltersInput,
    AutomationRuleSortableFields,
    SortOrder,
    useGetAutomationDataQuery,
} from '../../../../_gqlTypes';
import useLang from '../../../../hooks/useLang';
import {mapAutomationData} from './mapAutomationData';

export type AutomationData = {
    id: string;
    name: string;
    trigger: string;
    target: string;
    nb_actions: number;
    status: string;
};

export type AutomationPaginationParams = {
    currentPage: number;
    pageSize: number;
    filters?: AutomationRulesFiltersInput;
};

export const useGetAutomationData = ({currentPage, pageSize, filters}: AutomationPaginationParams) => {
    const {lang} = useLang();
    const {data, loading, error} = useGetAutomationDataQuery({
        fetchPolicy: 'no-cache',
        variables: {
            filters,
            sort: {
                field: AutomationRuleSortableFields.id,
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
        };
    }

    return {
        data: mapAutomationData(data?.automationRules, lang) ?? [],
        total: data.automationRules?.totalCount ?? 0,
        loading,
        error,
    };
};
