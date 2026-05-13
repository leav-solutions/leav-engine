import {type FetchResult} from '@apollo/client';
import {type WithTypename} from '@leav/utils';
import {type DeleteViewMutation, useDeleteViewMutation} from '_ui/_gqlTypes';

export interface IUseExecuteDeleteViewMutationHook {
    deleteView: (viewId: string) => Promise<FetchResult<DeleteViewMutation>>;
}

export default function useExecuteDeleteViewMutation(): IUseExecuteDeleteViewMutationHook {
    const [executeDeleteView] = useDeleteViewMutation();

    return {
        deleteView(viewId: string) {
            return executeDeleteView({
                variables: {
                    viewId,
                },
                update: (cache, {data}) => {
                    const cacheKey = cache.identify(data.deleteView as WithTypename<DeleteViewMutation['deleteView']>);
                    cache.evict({id: cacheKey});
                    cache.gc();
                },
            });
        },
    };
}
