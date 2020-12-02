// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DataProxy} from 'apollo-cache';
import React from 'react';
import {useTranslation} from 'react-i18next';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {DeleteTreeMutation, deleteTreeQuery} from '../../../queries/trees/deleteTreeMutation';
import {getTreesQuery, getTreesQueryName} from '../../../queries/trees/getTreesQuery';
import {clearCacheQueriesFromRegexp} from '../../../utils';
import {addWildcardToFilters, localizedLabel} from '../../../utils/utils';
import {GET_TREES, GET_TREESVariables, GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
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

    const _updateCache = (cache: DataProxy, {data: {deleteTree}}: any) => {
        const cacheData = cache.readQuery<GET_TREES, GET_TREESVariables>({
            query: getTreesQuery,
            variables: {...addWildcardToFilters(filters), lang: availableLanguages}
        });

        if (!cacheData) {
            return;
        }

        clearCacheQueriesFromRegexp(cache, /ROOT_QUERY.trees/);

        if (!cacheData) {
            return;
        }

        const newCount = cacheData.trees?.totalCount ? cacheData.trees?.totalCount - 1 : 0;
        const newList = cacheData.trees?.list ? cacheData.trees.list.filter(l => l.id !== deleteTree.id) : [];

        cache.writeQuery<GET_TREES, GET_TREESVariables>({
            query: getTreesQuery,
            variables: {...addWildcardToFilters(filters), lang: availableLanguages},
            data: {trees: {...cacheData.trees, totalCount: newCount, list: newList}}
        });
    };

    // VERIF if you can delete the 'refetchQueries'

    return !!tree && userData.permissions[PermissionsActions.app_delete_tree] ? (
        <DeleteTreeMutation mutation={deleteTreeQuery} refetchQueries={[getTreesQueryName]} update={_updateCache}>
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
