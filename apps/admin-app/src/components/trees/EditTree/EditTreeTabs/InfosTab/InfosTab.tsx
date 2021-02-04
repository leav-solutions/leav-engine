// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery, useMutation} from '@apollo/react-hooks';
import {History} from 'history';
import React from 'react';
import {getTreesQuery} from '../../../../../queries/trees/getTreesQuery';
import {saveTreeQuery} from '../../../../../queries/trees/saveTreeMutation';
import {clearCacheQueriesFromRegexp} from '../../../../../utils';
import {GET_TREES, GET_TREESVariables, GET_TREES_trees_list} from '../../../../../_gqlTypes/GET_TREES';
import {SAVE_TREE, SAVE_TREEVariables} from '../../../../../_gqlTypes/SAVE_TREE';
import TreeInfosForm from './InfosForm';

interface ITreeInfosTabProps {
    tree: GET_TREES_trees_list | null;
    readonly: boolean;
    history: History;
}

function TreeInfosTab({tree, history, readonly}: ITreeInfosTabProps): JSX.Element {
    const [saveTree] = useMutation<SAVE_TREE, SAVE_TREEVariables>(saveTreeQuery, {
        update: async (cache, {data: treeData}) => {
            if (!treeData) {
                return;
            }

            clearCacheQueriesFromRegexp(cache, /ROOT_QUERY.trees/);

            const newTrees = {
                totalCount: 1,
                list: [treeData.saveTree],
                __typename: 'TreesList'
            };

            cache.writeQuery({
                query: getTreesQuery,
                data: {trees: newTrees},
                variables: {id: treeData.saveTree.id}
            });
        }
    });

    const [getTreeById, {data: dataTreeById}] = useLazyQuery<GET_TREES, GET_TREESVariables>(getTreesQuery);

    const _handleSubmit = async treeData => {
        await saveTree({
            variables: {
                treeData: {
                    id: treeData.id,
                    label: treeData.label,
                    libraries: treeData.libraries
                }
            },
            refetchQueries: ['GET_TREES']
        });
        if (history) {
            history.replace({pathname: '/trees/edit/' + treeData.id});
        }
    };

    const _handleCheckIdExists = async val => {
        await getTreeById({variables: {id: val}});
        return !!dataTreeById && !!dataTreeById.trees && !dataTreeById.trees.list.length;
    };

    return (
        <TreeInfosForm
            tree={tree}
            readonly={readonly}
            onSubmit={_handleSubmit}
            onCheckIdExists={_handleCheckIdExists}
        />
    );
}

export default TreeInfosTab;
