// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type StoreObject} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {getTreesQueryName} from '../../../queries/trees/getTreesQuery';
import {deleteFromCache, localizedLabel} from '../../../utils/utils';
import {type GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {PermissionsActions, useDeleteTreeMutation} from '../../../_gqlTypes';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';

interface IDeleteTreeProps {
    tree?: GET_TREES_trees_list;
    filters?: any;
}

const DeleteTree = ({tree, filters}: IDeleteTreeProps): JSX.Element | null => {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const userData = useUserData();
    const [deleteTree] = useDeleteTreeMutation({
        refetchQueries: [getTreesQueryName],
        update: (cache, {data}) => {
            deleteFromCache(cache, data.deleteTree as unknown as StoreObject);
        },
    });

    const _handleDelete = async () =>
        deleteTree({
            variables: {treeId: tree.id},
        });

    const treeLabel = localizedLabel(tree.label, availableLanguages);

    return !!tree && userData.permissions[PermissionsActions.admin_delete_tree] ? (
        <ConfirmedButton action={_handleDelete} confirmMessage={t('trees.confirm_delete', {treeLabel})}>
            <DeleteButton disabled={tree.system} />
        </ConfirmedButton>
    ) : (
        <></>
    );
};

export default DeleteTree;
