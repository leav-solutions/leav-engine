// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult, useQuery} from '@apollo/client';
import {GET_TREES, GET_TREESVariables, GET_TREES_trees_list} from '_gqlTypes/GET_TREES';
import {useApplicationContext} from 'context/ApplicationContext';
import {getTreeListQuery} from 'graphQL/queries/trees/getTreeListQuery';

interface IUseApplicationTreesParams {
    onlyAllowed?: boolean;
}

export interface IUseApplicationTreesHook {
    loading: boolean;
    trees: GET_TREES_trees_list[];
    error?: string;
    updateQuery: QueryResult['updateQuery'];
}

export const useApplicationTrees = (params: IUseApplicationTreesParams = {}): IUseApplicationTreesHook => {
    const {currentApp} = useApplicationContext();
    const {onlyAllowed = true} = params;

    const {loading, error, data, updateQuery} = useQuery<GET_TREES, GET_TREESVariables>(getTreeListQuery, {
        skip:
            currentApp?.settings?.trees === 'none' ||
            (Array.isArray(currentApp?.settings?.trees) && !currentApp.settings.trees.length), // Skip if no trees are selected
        variables: {
            filters: {
                id: Array.isArray(currentApp?.settings?.trees) ? currentApp.settings.trees.filter(t => !!t) : []
            }
        }
    });

    let trees = data?.trees.list ? [...data?.trees.list] : [];
    const treesOrder = currentApp?.settings?.treesOrder ?? [];
    const treesCount = trees.length;

    if (onlyAllowed) {
        trees = trees.filter(tree => tree.permissions.access_tree);
    }

    // Order trees according to treesOrder settings. If a library doesn't appear on order, put it at the end
    trees.sort((a, b) => {
        const aIndex = treesOrder.indexOf(a.id) > -1 ? treesOrder.indexOf(a.id) : treesCount;
        const bIndex = treesOrder.indexOf(b.id) > -1 ? treesOrder.indexOf(b.id) : treesCount;

        return aIndex - bIndex;
    });

    return {loading, trees, error: error?.message ?? null, updateQuery};
};
