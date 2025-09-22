// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
                variables
            });
        }
    };
}
