import {useGetAutomationRuleDetailsQuery} from '../../../_gqlTypes';
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
