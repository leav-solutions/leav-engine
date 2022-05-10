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
    const currentApp = useApplicationContext();

    const variables: GET_TREE_LIST_QUERYVariables = {};

    if (treeId) {
        variables.treeId = treeId;
    }

    const query = useQuery<GET_TREE_LIST_QUERY>(getTreeListQuery, {
        variables,
        skip,
        onCompleted: data => {
            const cleanData: GET_TREE_LIST_QUERY = {
                ...data,
                trees: {
                    list: data.trees.list.filter(
                        tree => (!onlyAllowed || tree.permissions.access_tree) && isTreeInApp(currentApp, tree.id)
                    )
                }
            };

            setQueryData(cleanData);
        }
    });

    return {...query, loading: query.loading || (!query.loading && typeof queryData === undefined), data: queryData};
}
