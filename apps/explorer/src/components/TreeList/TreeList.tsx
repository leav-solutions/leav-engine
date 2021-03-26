// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery, useMutation} from '@apollo/client';
import {Divider, Spin, PageHeader, Row} from 'antd';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '../../hooks/NotificationsHook/NotificationsHook';
import {getTreeListQuery} from '../../queries/trees/getTreeListQuery';
import {NotificationType} from '../../_types/types';
import TreeItem from '../TreeItem';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '../../_gqlTypes/SAVE_USER_DATA';
import {getUserDataQuery} from '../../queries/userData/getUserData';
import {saveUserData} from '../../queries/userData/saveUserData';
import ErrorDisplay from '../shared/ErrorDisplay';

export const FAVORITE_TREES_KEY = 'favorites_trees_ids';

function TreeList(): JSX.Element {
    const {t} = useTranslation();

    const {updateBaseNotification} = useNotifications();

    const treeListQuery = useQuery(getTreeListQuery);
    const userDataQuery = useQuery(getUserDataQuery, {
        variables: {key: FAVORITE_TREES_KEY}
    });

    const [updateFavoritesMutation] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData, {
        refetchQueries: [{
            query: getUserDataQuery,
            variables: {key: FAVORITE_TREES_KEY}}],
        ignoreResults: true
    });

    const updateFavorite = async (id: string) =>  {
        await updateFavoritesMutation({variables: {
            key: FAVORITE_TREES_KEY,
            value: favoriteIds.includes(id)
                ? favoriteIds.filter(e => e !== id)
                : favoriteIds.concat([id]),
            global: false
        }});
    };

    useEffect(() => {
        updateBaseNotification({content: t('notification.base-message'), type: NotificationType.basic});
    }, [updateBaseNotification, t]);

    if (treeListQuery.loading || userDataQuery.loading) {
        return <Spin />;
    }

    if (treeListQuery.error || userDataQuery.error) {
        return <ErrorDisplay message={treeListQuery.error.message ||  userDataQuery.error.message} />;
    }

    const treeList = treeListQuery.data?.trees?.list ?? [];
    const favoriteIds = userDataQuery.data?.userData?.data ?? [];

    return (
        <div className="wrapper-page">
            <PageHeader title={t('navigation.list.header')} />
            <Row gutter={[16, 16]}>
                {treeList.filter(tree => favoriteIds.includes(tree.id)).map(tree => (
                    <TreeItem key={tree.id} tree={tree} isFavorite={true} onUpdateFavorite={updateFavorite}/>
                ))}
            </Row>
            {favoriteIds.length > 0 && <Divider />}
            <Row gutter={[16, 16]}>
                {treeList.filter(tree => !favoriteIds.includes(tree.id)).map(tree => (
                    <TreeItem key={tree.id} tree={tree} onUpdateFavorite={updateFavorite}/>
                ))}
             </Row>
        </div>
    );
}

export default TreeList;
