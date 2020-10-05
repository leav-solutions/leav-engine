import {useLazyQuery, useMutation, useQuery} from '@apollo/react-hooks';
import {History, Location} from 'history';
import React from 'react';
import useUserData from '../../../hooks/useUserData';
import {getTreesQuery} from '../../../queries/trees/getTreesQuery';
import {saveTreeQuery} from '../../../queries/trees/saveTreeMutation';
import {clearCacheQueriesFromRegexp} from '../../../utils';
import {GET_TREES, GET_TREESVariables, GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';
import EditTreeForm from '../EditTreeForm';

interface IEditTreeProps {
    match: any;
    history: History;
    location: Location;
}

const EditTree = ({match, history, location}: IEditTreeProps): JSX.Element => {
    const treeId = match.params.id;
    const userData = useUserData();

    const {loading, error, data} = useQuery<GET_TREES, GET_TREESVariables>(getTreesQuery, {
        variables: {id: treeId}
    });

    const [saveTree, {error: errorSave}] = useMutation(saveTreeQuery, {
        update: async (cache, {data: dataCached}) => {
            const cachedData: any = cache.readQuery({query: getTreesQuery, variables: {id: dataCached.saveTree.id}});

            const newTree = dataCached.saveTree;

            clearCacheQueriesFromRegexp(cache, /ROOT_QUERY.trees/);

            const newTrees = {
                totalCount: 1,
                list: [newTree],
                __typename: cachedData.trees.__typename
            };

            cache.writeQuery({
                query: getTreesQuery,
                data: {trees: newTrees},
                variables: {id: dataCached.saveTree.id}
            });
        }
    });

    const [getTreeById, {data: dataTreeById}] = useLazyQuery<GET_TREES, GET_TREESVariables>(getTreesQuery);

    const _isIdUnique = async val => {
        await getTreeById({variables: {id: val}});
        return !!dataTreeById && !!dataTreeById.trees && !dataTreeById.trees.list.length;
    };

    const _getEditTreeForm = (treeToEdit: GET_TREES_trees_list | null) => {
        const readOnly = !userData.permissions[PermissionsActions.app_edit_tree];

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
                history={history}
                location={location}
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
