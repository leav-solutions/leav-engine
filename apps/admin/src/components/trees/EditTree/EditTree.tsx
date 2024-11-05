// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import React from 'react';
import useUserData from '../../../hooks/useUserData';
import {getTreeByIdQuery} from '../../../queries/trees/getTreeById';
import {GET_TREE_BY_ID, GET_TREE_BY_IDVariables} from '../../../_gqlTypes/GET_TREE_BY_ID';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';
import EditTreeTabs from './EditTreeTabs';

interface IEditTreeProps {
    match: any;
}

const EditTree = ({match}: IEditTreeProps): JSX.Element => {
    const treeId = match.params.id;
    const userData = useUserData();

    const {loading, error, data} = useQuery<GET_TREE_BY_ID, GET_TREE_BY_IDVariables>(getTreeByIdQuery, {
        variables: {id: treeId},
        skip: !treeId
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
            tree={data?.trees?.list[0] ?? null}
            readonly={!userData.permissions[PermissionsActions.admin_edit_tree]}
        />
    );
};

export default EditTree;
