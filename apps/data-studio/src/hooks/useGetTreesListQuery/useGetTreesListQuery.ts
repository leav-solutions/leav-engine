// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {QueryResult, useQuery} from '@apollo/client';
import {useApplicationContext} from 'context/ApplicationContext';
import {getTreeListQuery} from 'graphQL/queries/trees/getTreeListQuery';
import {useState} from 'react';
import {isTreeInApp} from 'utils';
import {GET_TREE_LIST_QUERY, GET_TREE_LIST_QUERYVariables} from '_gqlTypes/GET_TREE_LIST_QUERY';

export type IUseGetTreesListQueryHook = QueryResult<GET_TREE_LIST_QUERY>;

export interface IUseGetTreesListQueryHookParams {
    treeId?: string;
    onlyAllowed?: boolean;
    skip?: boolean;
}

export default function useGetTreesListQuery(params: IUseGetTreesListQueryHookParams = {}): IUseGetTreesListQueryHook {
    const [queryData, setQueryData] = useState<GET_TREE_LIST_QUERY>();
    const {treeId, onlyAllowed = true, skip = false} = params;
    const appData = useApplicationContext();
    const appTrees = appData?.currentApp?.settings?.trees ?? null;

    const variables: GET_TREE_LIST_QUERYVariables = {};

    if (treeId) {
        variables.treeId = treeId;
    }

    const query = useQuery<GET_TREE_LIST_QUERY>(getTreeListQuery, {
        variables,
        skip: skip || (onlyAllowed && appTrees === null),
        onCompleted: data => {
            const allowedTrees = data.trees.list.filter(
                tree => (!onlyAllowed || tree.permissions.access_tree) && isTreeInApp(appData.currentApp, tree.id)
            );

            if (appTrees.length) {
                allowedTrees.sort((treeA, treeB) => {
                    const indexTreeA = appTrees.findIndex(tree => tree.id === treeA.id);
                    const indexLibB = appTrees.findIndex(tree => tree.id === treeB.id);

                    return indexTreeA - indexLibB;
                });
            }

            const cleanData: GET_TREE_LIST_QUERY = {
                ...data,
                trees: {
                    list: allowedTrees
                }
            };

            setQueryData(cleanData);
        }
    });

    if (onlyAllowed && appTrees === null) {
        return {...query, loading: false, data: {trees: {list: []}}};
    }

    return {...query, loading: query.loading || (!query.loading && typeof queryData === undefined), data: queryData};
}