// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FetchResult} from '@apollo/client';
import {
    AddViewMutation,
    AddViewMutationVariables,
    GetViewsListQuery,
    GetViewsListQueryVariables,
    useAddViewMutation
} from '_ui/_gqlTypes';
import {getViewsListQuery} from '_ui/_queries/views/getViewsListQuery';

export interface IUseAddViewMutationHook {
    addView: (variables: AddViewMutationVariables) => Promise<FetchResult<AddViewMutation>>;
}

export default function useExecuteAddViewMutation(): IUseAddViewMutationHook {
    const [executeAddView] = useAddViewMutation();

    return {
        addView(variables) {
            return executeAddView({
                variables,
                update: (cache, mutationResult, options) => {
                    if (options.variables.view.id) {
                        return; // it's an update
                    }

                    const queryToUpdate = {
                        query: getViewsListQuery,
                        variables: {
                            libraryId: options.variables.view.library
                        }
                    };

                    const cacheData = cache.readQuery<GetViewsListQuery, GetViewsListQueryVariables>(queryToUpdate);

                    if (cacheData) {
                        cache.writeQuery<GetViewsListQuery, GetViewsListQueryVariables>({
                            ...queryToUpdate,
                            data: {
                                views: {
                                    list: [...cacheData.views.list, mutationResult.data.saveView],
                                    totalCount: cacheData.views.totalCount + 1
                                }
                            }
                        });
                    }
                }
            });
        }
    };
}
