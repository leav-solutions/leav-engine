import {useQuery} from '@apollo/client';
import {useCallback} from 'react';
import {getActiveTree, IActiveTree, IGetActiveTree} from '../../queries/cache/activeTree/getActiveTreeQuery';

export const useActiveTree = (): [IActiveTree | undefined, (newActiveLibrary: IActiveTree) => void] => {
    const {data, client} = useQuery<IGetActiveTree>(getActiveTree);

    const activeTree: IActiveTree | undefined = data?.activeTree;

    const updateActiveLibrary = useCallback(
        (newActiveTree: IActiveTree) => {
            client.writeQuery<IGetActiveTree>({
                query: getActiveTree,
                data: {
                    activeTree: newActiveTree
                }
            });
        },
        [client]
    );

    return [activeTree, updateActiveLibrary];
};
