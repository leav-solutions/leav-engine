// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {useCallback} from 'react';
import {getActiveTree, IActiveTree, IGetActiveTree} from '../../graphQL/queries/cache/activeTree/getActiveTreeQuery';

export const useActiveTree = (): [IActiveTree | undefined, (newActiveLibrary: IActiveTree) => void] => {
    const {data, client} = useQuery<IGetActiveTree>(getActiveTree);

    const activeTree: IActiveTree | undefined = data?.activeTree;

    const updateActiveTree = useCallback(
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

    return [activeTree, updateActiveTree];
};
