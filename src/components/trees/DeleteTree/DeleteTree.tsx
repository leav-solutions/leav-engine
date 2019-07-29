import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import useUserData from '../../../hooks/useUserData';
import {DeleteTreeMutation, deleteTreeQuery} from '../../../queries/trees/deleteTreeMutation';
import {getTreesQueryName} from '../../../queries/trees/getTreesQuery';
import {localizedLabel} from '../../../utils/utils';
import {GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';

interface IDeleteTreeProps extends WithNamespaces {
    tree?: GET_TREES_trees_list;
}

function DeleteTree({tree, t, i18n}: IDeleteTreeProps): JSX.Element | null {
    const userData = useUserData();

    return !!tree && userData.permissions[PermissionsActions.admin_delete_tree] ? (
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
    ) : null;
}

export default withNamespaces()(DeleteTree);
