// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useUserData from '../../../hooks/useUserData';
import {PermissionsActions, useGetTreeByIdQuery} from '../../../_gqlTypes';
import Loading from '../../shared/Loading';
import EditTreeTabs from './EditTreeTabs';
import {type GET_TREE_BY_ID_trees_list} from '../../../_gqlTypes/GET_TREE_BY_ID';
import {useParams} from 'react-router-dom';

const EditTree = (): JSX.Element => {
    const {id: treeId} = useParams();
    const userData = useUserData();

    const {loading, error, data} = useGetTreeByIdQuery({
        variables: {id: treeId},
        skip: !treeId,
    });

    if (loading) {
        return <Loading withDimmer />;
    }

    if (typeof error !== 'undefined') {
        return <p>Error: {error.message}</p>;
    }

    if (treeId && !data?.trees?.list.length) {
        return <div>Unknown tree</div>;
    }

    return (
        <EditTreeTabs
            tree={(data?.trees?.list[0] as GET_TREE_BY_ID_trees_list) ?? null}
            readonly={!userData.permissions[PermissionsActions.admin_edit_tree]}
        />
    );
};

export default EditTree;
