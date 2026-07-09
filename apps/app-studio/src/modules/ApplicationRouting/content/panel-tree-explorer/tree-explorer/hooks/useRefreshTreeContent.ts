import {useApolloClient} from '@apollo/client';

/**
 * Evicts the cached `treeNodeChildren` fields of a given tree so every open column refetches.
 * Used after any mutation that changes the tree structure (add / move / detach).
 */
export const useRefreshTreeContent = (treeId: string) => {
    const client = useApolloClient();
    return {
        refreshTreeContent() {
            client.refetchQueries({
                updateCache: cache => {
                    const cacheContent = cache.extract() as {
                        ROOT_QUERY: Record<string, unknown>;
                        [key: string]: unknown;
                    };
                    Object.keys(cacheContent.ROOT_QUERY)
                        .filter(key => key.match(new RegExp(`treeNodeChildren(.*)${treeId}`)))
                        .forEach(key => cache.evict({fieldName: key}));

                    cache.gc();
                },
            });
        },
    };
};
