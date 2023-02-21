// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FetchResult, useMutation} from '@apollo/client';
import {
    PREFIX_SHARED_VIEWS_ORDER_KEY,
    PREFIX_USER_VIEWS_ORDER_KEY
} from 'components/LibraryItemsList/ViewPanel/ViewPanel';
import saveViewMutation from 'graphQL/mutations/views/saveViewMutation';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {getViewsListQuery} from 'graphQL/queries/views/getViewsListQuery';
import {ADD_VIEW, ADD_VIEWVariables} from '_gqlTypes/ADD_VIEW';

export interface IUseAddViewMutationHook {
    addView: (variables: ADD_VIEWVariables) => Promise<FetchResult<ADD_VIEW>>;
}

export default function useAddViewMutation(library: string): IUseAddViewMutationHook {
    const [executeAddView] = useMutation<ADD_VIEW, ADD_VIEWVariables>(saveViewMutation);

    return {
        addView(variables: ADD_VIEWVariables) {
            return executeAddView({
                variables,
                refetchQueries: [
                    {
                        query: getViewsListQuery,
                        variables: {
                            libraryId: library
                        }
                    }
                ]
            });
        }
    };
}
