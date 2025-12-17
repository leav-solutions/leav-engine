// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useHistory} from 'react-router-dom-v5';
import {clearCacheForQuery} from '../../../../../utils';
import {type GET_TREES_trees_list} from '../../../../../_gqlTypes/GET_TREES';
import {type GET_TREE_BY_ID_trees_list} from '../../../../../_gqlTypes/GET_TREE_BY_ID';
import {type TreeInput} from '../../../../../_gqlTypes/globalTypes';
import TreeInfosForm from './InfosForm';
import {useGetTreesLazyQuery, useSaveTreeMutation} from '_gqlTypes';

interface ITreeInfosTabProps {
    tree: GET_TREES_trees_list | null;
    readonly: boolean;
}

function TreeInfosTab({tree, readonly}: ITreeInfosTabProps): JSX.Element {
    const history = useHistory();
    const isNewTree = !tree;
    const [saveTree] = useSaveTreeMutation({
        update: async cache => {
            if (!tree) {
                clearCacheForQuery(cache, 'trees');
            }
        },
    });

    const [getTreeById, {data: dataTreeById}] = useGetTreesLazyQuery({
        fetchPolicy: 'no-cache',
    });

    const _handleSubmit = async (treeData: TreeInput) => {
        await saveTree({
            variables: {
                treeData: {
                    id: treeData.id,
                    label: treeData.label,
                    libraries: treeData.libraries?.filter(l => l.library) ?? null,
                },
            },
            refetchQueries: ['GET_TREES'],
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
