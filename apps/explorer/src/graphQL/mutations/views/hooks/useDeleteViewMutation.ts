// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FetchResult, useMutation} from '@apollo/client';
import {WithTypename} from '@leav/utils/src';
import {DELETE_VIEW, DELETE_VIEWVariables, DELETE_VIEW_deleteView} from '_gqlTypes/DELETE_VIEW';
import deleteViewMutation from '../deleteViewMutation';

export interface IUseDeleteViewMutationHook {
    deleteView: (viewId: string) => Promise<FetchResult<DELETE_VIEW>>;
}

export default function useDeleteViewMutation(): IUseDeleteViewMutationHook {
    const [executeDeleteView] = useMutation<DELETE_VIEW, DELETE_VIEWVariables>(deleteViewMutation);

    return {
        deleteView(viewId: string) {
            return executeDeleteView({
                variables: {
                    viewId
                },
                update: (cache, {data}) => {
                    const cacheKey = cache.identify(data.deleteView as WithTypename<DELETE_VIEW_deleteView>);
                    cache.evict({id: cacheKey});
                    cache.gc();
                }
            });
        }
    };
}
