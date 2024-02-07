// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery, useMutation} from '@apollo/client';
import {useHistory} from 'react-router-dom-v5';
import {getTreesQuery} from '../../../../../queries/trees/getTreesQuery';
import {saveTreeQuery} from '../../../../../queries/trees/saveTreeMutation';
import {clearCacheForQuery} from '../../../../../utils';
import {GET_TREES, GET_TREESVariables, GET_TREES_trees_list} from '../../../../../_gqlTypes/GET_TREES';
import {GET_TREE_BY_ID_trees_list} from '../../../../../_gqlTypes/GET_TREE_BY_ID';
import {TreeInput} from '../../../../../_gqlTypes/globalTypes';
import {SAVE_TREE, SAVE_TREEVariables} from '../../../../../_gqlTypes/SAVE_TREE';
import TreeInfosForm from './InfosForm';

interface ITreeInfosTabProps {
    tree: GET_TREES_trees_list | null;
    readonly: boolean;
}

function TreeInfosTab({tree, readonly}: ITreeInfosTabProps): JSX.Element {
    const history = useHistory();
    const isNewTree = !tree;
    const [saveTree] = useMutation<SAVE_TREE, SAVE_TREEVariables>(saveTreeQuery, {
        update: async cache => {
            if (!tree) {
                clearCacheForQuery(cache, 'trees');
            }
        }
    });

    const [getTreeById, {data: dataTreeById}] = useLazyQuery<GET_TREES, GET_TREESVariables>(getTreesQuery, {
        fetchPolicy: 'no-cache'
    });

    const _handleSubmit = async (treeData: TreeInput) => {
        await saveTree({
            variables: {
                treeData: {
                    id: treeData.id,
                    label: treeData.label,
                    libraries: treeData.libraries?.filter(l => l.library) ?? null
                }
            },
            refetchQueries: ['GET_TREES']
        });

        if (isNewTree) {
            history.replace({pathname: '/trees/edit/' + treeData.id});
        }
    };

    const _handleCheckIdExists = async (val: string) => {
        await getTreeById({variables: {filters: {id: [val]}}});
        return !!dataTreeById && !!dataTreeById.trees && !dataTreeById.trees.list.length;
    };

    return (
        <TreeInfosForm
            tree={tree as GET_TREE_BY_ID_trees_list}
            readonly={readonly}
            onSubmit={_handleSubmit}
            onCheckIdExists={_handleCheckIdExists}
        />
    );
}

export default TreeInfosTab;
