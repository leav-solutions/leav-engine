import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {DeleteTreeMutation, deleteTreeQuery} from '../../../queries/trees/deleteTreeMutation';
import {getTreesQueryName} from '../../../queries/trees/getTreesQuery';
import {localizedLabel} from '../../../utils/utils';
import {GET_TREES_trees} from '../../../_gqlTypes/GET_TREES';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';

interface IDeleteTreeProps extends WithNamespaces {
    tree?: GET_TREES_trees;
}

class DeleteTree extends React.Component<IDeleteTreeProps> {
    constructor(props: IDeleteTreeProps) {
        super(props);
    }

    public render() {
        const {tree, t, i18n} = this.props;

        return !!tree ? (
            <DeleteTreeMutation mutation={deleteTreeQuery} refetchQueries={[getTreesQueryName]}>
                {deleteTree => {
                    const onDelete = async () =>
                        deleteTree({
                            variables: {treeId: tree.id}
                        });

                    const treeLabel = localizedLabel(tree.label, i18n);

                    return (
                        <ConfirmedButton action={onDelete} confirmMessage={t('trees.confirm_delete', {treeLabel})}>
                            <DeleteButton disabled={tree.system} />
                        </ConfirmedButton>
                    );
                }}
            </DeleteTreeMutation>
        ) : (
            ''
        );
    }
}

export default withNamespaces()(DeleteTree);
