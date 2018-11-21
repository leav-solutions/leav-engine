import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import ConfirmedButton from 'src/components/shared/ConfirmedButton';
import DeleteButton from 'src/components/shared/DeleteButton';
import {DeleteTreeMutation, deleteTreeQuery} from 'src/queries/deleteTreeMutation';
import {getTreesQueryName} from 'src/queries/getTreesQuery';
import {localizedLabel} from 'src/utils/utils';
import {GET_TREES_trees} from 'src/_gqlTypes/GET_TREES';

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
