// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetAutomationRuleDetailsQuery} from '../../../../_gqlTypes';
import {mapAutomationRuleDetails} from './mapAutomationRuleDetails';

type UseGetAutomationRuleDetailsParams = {
    id: string;
};

export const useGetAutomationRuleDetails = ({id}: UseGetAutomationRuleDetailsParams) => {
    const {data, loading, error} = useGetAutomationRuleDetailsQuery({
        fetchPolicy: 'no-cache',
        variables: {
            filters: {id},
        },
    });

    if (loading || error || !data) {
        return {data: null, loading, error};
    }

    return {
        data: mapAutomationRuleDetails(data.automationRules),
        loading,
        error,
    };
};
