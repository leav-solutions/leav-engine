// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FetchResult, useMutation} from '@apollo/client';
import saveViewMutation from 'graphQL/mutations/views/saveViewMutation';
import {getViewsListQuery} from 'graphQL/queries/views/getViewsListQuery';
import {ADD_VIEW, ADD_VIEWVariables} from '_gqlTypes/ADD_VIEW';
import {GET_VIEWS_LIST, GET_VIEWS_LISTVariables} from '_gqlTypes/GET_VIEWS_LIST';

export interface IUseAddViewMutationHook {
    addView: (variables: ADD_VIEWVariables) => Promise<FetchResult<ADD_VIEW>>;
}

export default function useAddViewMutation(library: string): IUseAddViewMutationHook {
    const [executeAddView] = useMutation<ADD_VIEW, ADD_VIEWVariables>(saveViewMutation);

    return {
        addView(variables: ADD_VIEWVariables) {
            return executeAddView({
                variables,
                update: (cache, mutationResult, options) => {
                    const queryToUpdate = {
                        query: getViewsListQuery,
                        variables: {
                            libraryId: options.variables.view.library
                        }
                    };

                    const cacheData = cache.readQuery<GET_VIEWS_LIST, GET_VIEWS_LISTVariables>(queryToUpdate);

                    // check if it's an update or a new vew
                    const list = options.variables.view.id
                        ? cacheData.views.list.map(v => {
                              if (v.id === options.variables.view.id) {
                                  return mutationResult.data.saveView;
                              }

                              return v;
                          })
                        : [...cacheData.views.list, mutationResult.data.saveView];

                    const totalCount = options.variables.view.id
                        ? cacheData.views.totalCount
                        : cacheData.views.totalCount + 1;

                    cache.writeQuery<GET_VIEWS_LIST, GET_VIEWS_LISTVariables>({
                        ...queryToUpdate,
                        data: {
                            views: {
                                list,
                                totalCount
                            }
                        }
                    });
                }
            });
        }
    };
}
