import {History} from 'history';
import React from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import useUserData from '../../../hooks/useUserData';
import {getTreesQuery, TreesQuery} from '../../../queries/trees/getTreesQuery';
import {SaveTreeMutation, saveTreeQuery} from '../../../queries/trees/saveTreeMutation';
import {GET_TREES_trees} from '../../../_gqlTypes/GET_TREES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';
import EditTreeForm from '../EditTreeForm';

interface IEditTreeProps extends WithNamespaces {
    match: any;
    history: History;
}

function EditTree({match, history}: IEditTreeProps): JSX.Element {
    const treeId = match.params.id;
    const userData = useUserData();

    const _getEditTreeForm = (treeToEdit: GET_TREES_trees | null) => {
        const readOnly = !userData.permissions[PermissionsActions.admin_edit_tree];

        return (
            <SaveTreeMutation mutation={saveTreeQuery}>
                {saveTree => {
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

                    return <EditTreeForm tree={treeToEdit} onSubmit={onFormSubmit} readOnly={readOnly} />;
                }}
            </SaveTreeMutation>
        );
    };

    return treeId ? (
        <TreesQuery query={getTreesQuery} variables={{id: treeId}}>
            {({loading, error, data}) => {
                if (loading || !data) {
                    return <Loading withDimmer />;
                }

                if (data.trees === null) {
                    return 'Unknown tree';
                }

                return _getEditTreeForm(data.trees[0]);
            }}
        </TreesQuery>
    ) : (
        _getEditTreeForm(null)
    );
}
export default withNamespaces()(EditTree);
