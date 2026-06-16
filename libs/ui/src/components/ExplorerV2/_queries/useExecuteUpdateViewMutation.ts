import {type FetchResult} from '@apollo/client';
import {type UpdateViewMutation, type UpdateViewMutationVariables, useUpdateViewMutation} from '_ui/_gqlTypes';

export interface IUseUpdateViewMutationHook {
    updateView: (variables: UpdateViewMutationVariables) => Promise<FetchResult<UpdateViewMutation>>;
}

export default function useExecuteUpdateViewMutation(): IUseUpdateViewMutationHook {
    const [executeUpdateView] = useUpdateViewMutation();

    return {
        updateView(variables) {
            return executeUpdateView({
                variables,
            });
        },
    };
}
