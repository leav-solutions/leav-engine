// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FetchResult, useMutation} from '@apollo/client';
import {
    PREFIX_SHARED_VIEWS_ORDER_KEY,
    PREFIX_USER_VIEWS_ORDER_KEY
} from 'components/LibraryItemsList/ViewPanel/ViewPanel';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {GET_USER_DATA, GET_USER_DATAVariables} from '_gqlTypes/GET_USER_DATA';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '_gqlTypes/SAVE_USER_DATA';

export interface IUseUpdateViewsOrderMutation {
    updateViewsOrder: (variables: SAVE_USER_DATAVariables) => Promise<FetchResult<SAVE_USER_DATA>>;
}

export default function useUpdateViewsOrderMutation(library: string): IUseUpdateViewsOrderMutation {
    const [executeUpdateViewsOrder] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData);

    return {
        updateViewsOrder(variables: SAVE_USER_DATAVariables) {
            return executeUpdateViewsOrder({
                variables,
                update: (cache, mutationResult, options) => {
                    const queryToUpdate = {
                        query: getUserDataQuery,
                        variables: {
                            keys: [PREFIX_USER_VIEWS_ORDER_KEY + library, PREFIX_SHARED_VIEWS_ORDER_KEY + library]
                        }
                    };

                    const cacheData = cache.readQuery<GET_USER_DATA, GET_USER_DATAVariables>(queryToUpdate);

                    if (cacheData) {
                        cache.writeQuery<GET_USER_DATA, GET_USER_DATAVariables>({
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
