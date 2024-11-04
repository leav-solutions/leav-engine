// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PREFIX_SHARED_VIEWS_ORDER_KEY, PREFIX_USER_VIEWS_ORDER_KEY} from '_ui/constants';
import {
    GetUserDataQuery,
    GetUserDataQueryVariables,
    SaveUserDataMutationResult,
    SaveUserDataMutationVariables,
    useSaveUserDataMutation
} from '_ui/_gqlTypes';
import {getUserDataQuery} from '_ui/_queries/userData/getUserData';

export interface IUseUpdateViewsOrderMutation {
    updateViewsOrder: (variables: SaveUserDataMutationVariables) => Promise<SaveUserDataMutationResult>;
}

export default function useUpdateViewsOrderMutation(library: string) {
    const [executeUpdateViewsOrder] = useSaveUserDataMutation();

    return {
        updateViewsOrder(variables: SaveUserDataMutationVariables) {
            return executeUpdateViewsOrder({
                variables,
                update: (cache, mutationResult, options) => {
                    const queryToUpdate = {
                        query: getUserDataQuery,
                        variables: {
                            keys: [PREFIX_USER_VIEWS_ORDER_KEY + library, PREFIX_SHARED_VIEWS_ORDER_KEY + library]
                        }
                    };

                    const cacheData = cache.readQuery<GetUserDataQuery, GetUserDataQueryVariables>(queryToUpdate);

                    if (cacheData) {
                        cache.writeQuery<GetUserDataQuery, GetUserDataQueryVariables>({
                            ...queryToUpdate,
                            data: {
                                userData: {
                                    global: cacheData.userData.global,
                                    data: {
                                        ...cacheData.userData.data,
                                        [options.variables.key]:
                                            mutationResult.data.saveUserData.data[options.variables.key]
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    };
}
