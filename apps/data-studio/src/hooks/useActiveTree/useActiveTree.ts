import {useQuery} from '@apollo/client';
import {useCallback} from 'react';
import {
    getActiveTree,
    type IActiveTree,
    type IGetActiveTree,
} from '../../graphQL/queries/cache/activeTree/getActiveTreeQuery';

export const useActiveTree = (): [IActiveTree | undefined, (newActiveTree: IActiveTree) => void] => {
    const {data, client} = useQuery<IGetActiveTree>(getActiveTree);

    const activeTree = data?.activeTree;

    const updateActiveTree = useCallback(
        (newActiveTree: IActiveTree) => {
            client.writeQuery<IGetActiveTree>({
                query: getActiveTree,
                data: {
                    activeTree: newActiveTree,
                },
            });
        },
        [client],
    );

    return [activeTree, updateActiveTree];
};
