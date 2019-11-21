import React from 'react';
import {useTranslation} from 'react-i18next';
import useUserData from '../../../hooks/useUserData';
import {DeleteTreeMutation, deleteTreeQuery} from '../../../queries/trees/deleteTreeMutation';
import {getTreesQueryName} from '../../../queries/trees/getTreesQuery';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import {GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';

interface IDeleteTreeProps {
    tree?: GET_TREES_trees_list;
}

/* tslint:disable-next-line:variable-name */
const DeleteTree = ({tree}: IDeleteTreeProps): JSX.Element | null => {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const userData = useUserData();

    return !!tree && userData.permissions[PermissionsActions.admin_delete_tree] ? (
        <DeleteTreeMutation mutation={deleteTreeQuery} refetchQueries={[getTreesQueryName]}>
            {deleteTree => {
                const onDelete = async () =>
                    deleteTree({
                        variables: {treeId: tree.id}
                    });

                const treeLabel = localizedLabel(tree.label, availableLanguages);

                return (
                    <ConfirmedButton action={onDelete} confirmMessage={t('trees.confirm_delete', {treeLabel})}>
                        <DeleteButton disabled={tree.system} />
                    </ConfirmedButton>
                );
            }}
        </DeleteTreeMutation>
    ) : null;
};

export default DeleteTree;
