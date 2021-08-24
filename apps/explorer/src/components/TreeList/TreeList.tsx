// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import {Divider, PageHeader, Row, Spin} from 'antd';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import {getTreeListQuery} from 'graphQL/queries/trees/getTreeListQuery';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {default as React, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {setNotificationBase} from 'redux/notifications';
import {useAppDispatch} from 'redux/store';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '../../_gqlTypes/SAVE_USER_DATA';
import {IBaseNotification, NotificationType} from '../../_types/types';
import ErrorDisplay from '../shared/ErrorDisplay';
import TreeItem from '../TreeItem';

export const FAVORITE_TREES_KEY = 'favorites_trees_ids';

function TreeList(): JSX.Element {
    const {t} = useTranslation();

    const dispatch = useAppDispatch();

    const treeListQuery = useQuery(getTreeListQuery);
    const userDataQuery = useQuery(getUserDataQuery, {
        variables: {keys: [FAVORITE_TREES_KEY]}
    });

    const [updateFavoritesMutation] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData, {
        refetchQueries: [
            {
                query: getUserDataQuery,
                variables: {keys: [FAVORITE_TREES_KEY]}
            }
        ],
        ignoreResults: true
    });

    const updateFavorite = async (id: string) => {
        await updateFavoritesMutation({
            variables: {
                key: FAVORITE_TREES_KEY,
                value: favoriteIds.includes(id) ? favoriteIds.filter(e => e !== id) : favoriteIds.concat([id]),
                global: false
            }
        });
    };

    useEffect(() => {
        const baseNotification: IBaseNotification = {
            content: t('notification.base-message'),
            type: NotificationType.basic
        };
        dispatch(setNotificationBase(baseNotification));
    }, [t, dispatch]);

    if (treeListQuery.loading || userDataQuery.loading) {
        return <Spin />;
    }

    if (treeListQuery.error || userDataQuery.error) {
        return <ErrorDisplay message={treeListQuery.error.message || userDataQuery.error.message} />;
    }

    const treeList = treeListQuery.data?.trees?.list ?? [];
    const favoriteIds = userDataQuery.data?.userData?.data[FAVORITE_TREES_KEY] ?? [];

    return (
        <div className="wrapper-page">
            <PageHeader title={t('navigation.list.header')} />
            <Row gutter={[16, 16]}>
                {treeList
                    .filter(tree => favoriteIds.includes(tree.id))
                    .map(tree => (
                        <TreeItem key={tree.id} tree={tree} isFavorite={true} onUpdateFavorite={updateFavorite} />
                    ))}
            </Row>
            {favoriteIds.length > 0 && <Divider />}
            <Row gutter={[16, 16]}>
                {treeList
                    .filter(tree => !favoriteIds.includes(tree.id))
                    .map(tree => (
                        <TreeItem key={tree.id} tree={tree} onUpdateFavorite={updateFavorite} />
                    ))}
            </Row>
        </div>
    );
}

export default TreeList;
