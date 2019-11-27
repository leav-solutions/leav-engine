import {useLazyQuery, useMutation, useQuery} from '@apollo/react-hooks';
import {History} from 'history';
import React from 'react';
import useUserData from '../../../hooks/useUserData';
import {getTreesQuery} from '../../../queries/trees/getTreesQuery';
import {saveTreeQuery} from '../../../queries/trees/saveTreeMutation';
import {GET_TREES, GET_TREESVariables, GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';
import EditTreeForm from '../EditTreeForm';

interface IEditTreeProps {
    match: any;
    history: History;
}

/* tslint:disable-next-line:variable-name */
const EditTree = ({match, history}: IEditTreeProps): JSX.Element => {
    const treeId = match.params.id;
    const userData = useUserData();

    const {loading, error, data} = useQuery<GET_TREES, GET_TREESVariables>(getTreesQuery, {
        variables: {id: treeId}
    });
    const [saveTree, {error: errorSave}] = useMutation(saveTreeQuery);
    const [getTreeById, {data: dataTreeById}] = useLazyQuery<GET_TREES, GET_TREESVariables>(getTreesQuery);

    const _isIdUnique = async val => {
        await getTreeById({variables: {id: val}});

        return !!dataTreeById && !!dataTreeById.trees && !dataTreeById.trees.list.length;
    };

    const _getEditTreeForm = (treeToEdit: GET_TREES_trees_list | null) => {
        const readOnly = !userData.permissions[PermissionsActions.admin_edit_tree];

        const onFormSubmit = async treeData => {
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

        const formErrors = errorSave && errorSave.graphQLErrors.length ? errorSave.graphQLErrors[0] : null;

        return (
            <EditTreeForm
                tree={treeToEdit}
                onSubmit={onFormSubmit}
                readOnly={readOnly}
                errors={formErrors}
                onCheckIdExists={_isIdUnique}
            />
        );
    };

    if (!treeId) {
        return _getEditTreeForm(null);
    }

    if (loading) {
        return <Loading withDimmer />;
    }

    if (typeof error !== 'undefined') {
        return <p>Error: {error.message}</p>;
    }

    if (!data || !data.trees || !data.trees.list.length) {
        return <div>Unknown tree</div>;
    }

    return _getEditTreeForm(data.trees.list[0]);
};
export default EditTree;
