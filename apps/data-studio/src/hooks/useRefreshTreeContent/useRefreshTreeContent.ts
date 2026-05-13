import {useApolloClient} from '@apollo/client';

const useRefreshTreeContent = (treeId: string) => {
    const client = useApolloClient();
    return {
        refreshTreeContent() {
            client.refetchQueries({
                updateCache: cache => {
                    const cacheContent = cache.extract() as {
                        ROOT_QUERY: Record<string, any>;
                        [key: string]: any;
                    };
                    Object.keys(cacheContent.ROOT_QUERY)
                        .filter(key => key.match(new RegExp(`treeNodeChildren(.*)${treeId}`)))
                        .forEach(key => cache.evict({fieldName: key}));

                    // Collect the garbage
                    cache.gc();
                },
            });
        },
    };
};
export default useRefreshTreeContent;
