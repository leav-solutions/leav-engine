// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FetchResult} from '@apollo/client';
import {WithTypename} from '@leav/utils';
import {DeleteViewMutation, useDeleteViewMutation} from '_ui/_gqlTypes';

export interface IUseExecuteDeleteViewMutationHook {
    deleteView: (viewId: string) => Promise<FetchResult<DeleteViewMutation>>;
}

export default function useExecuteDeleteViewMutation(): IUseExecuteDeleteViewMutationHook {
    const [executeDeleteView] = useDeleteViewMutation();

    return {
        deleteView(viewId: string) {
            return executeDeleteView({
                variables: {
                    viewId
                },
                update: (cache, {data}) => {
                    const cacheKey = cache.identify(data.deleteView as WithTypename<DeleteViewMutation['deleteView']>);
                    cache.evict({id: cacheKey});
                    cache.gc();
                }
            });
        }
    };
}
