import {History} from 'history';
import React from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import {getTreesQuery, TreesQuery} from '../../../queries/trees/getTreesQuery';
import {SaveTreeMutation, saveTreeQuery} from '../../../queries/trees/saveTreeMutation';
import {GET_TREES_trees} from '../../../_gqlTypes/GET_TREES';
import Loading from '../../shared/Loading';
import EditTreeForm from '../EditTreeForm';

interface IEditTreeProps extends WithNamespaces {
    match: any;
    history: History;
}

const _getEditTreeForm = (treeToEdit: GET_TREES_trees | null, history?: History) => {
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

                return <EditTreeForm tree={treeToEdit} onSubmit={onFormSubmit} />;
            }}
        </SaveTreeMutation>
    );
};

function EditTree({match, history}: IEditTreeProps): JSX.Element {
    const treeId = match.params.id;

    return treeId ? (
        <TreesQuery query={getTreesQuery} variables={{id: treeId}}>
            {({loading, error, data}) => {
                if (loading || !data) {
                    return <Loading withDimmer />;
                }

                if (data.trees === null) {
                    return 'Unknown tree';
                }

                return _getEditTreeForm(data.trees[0], history);
            }}
        </TreesQuery>
    ) : (
        _getEditTreeForm(null, history)
    );
}
export default withNamespaces()(EditTree);
