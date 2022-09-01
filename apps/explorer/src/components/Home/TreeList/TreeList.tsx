// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import {PageHeader, Table} from 'antd';
import {ColumnsType} from 'antd/lib/table';
import TreeIcon from 'components/shared/TreeIcon';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {useLang} from 'hooks/LangHook/LangHook';
import useGetTreesListQuery from 'hooks/useGetTreesListQuery/useGetTreesListQuery';
import {default as React, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {setNotificationBase} from 'redux/notifications';
import {useAppDispatch} from 'redux/store';
import styled from 'styled-components';
import {getTreeLink, localizedTranslation} from 'utils';
import {GET_USER_DATA, GET_USER_DATAVariables} from '_gqlTypes/GET_USER_DATA';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '../../../_gqlTypes/SAVE_USER_DATA';
import {IBaseNotification, NotificationType} from '../../../_types/types';
import ErrorDisplay from '../../shared/ErrorDisplay';
import FavoriteStar from '../FavoriteStar';

export const FAVORITE_TREES_KEY = 'favorites_trees_ids';

const TreeLink = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
    width: 100%;
    color: inherit;
`;

interface IListItem {
    key: string;
    id: string;
    label: string;
    isFavorite: boolean;
}

function TreeList(): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const dispatch = useAppDispatch();

    const treeListQuery = useGetTreesListQuery();
    const userDataQuery = useQuery<GET_USER_DATA, GET_USER_DATAVariables>(getUserDataQuery, {
        variables: {keys: [FAVORITE_TREES_KEY]}
    });

    const [updateFavoritesMutation] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData, {
        ignoreResults: true
    });

    useEffect(() => {
        const baseNotification: IBaseNotification = {
            content: t('notification.base-message'),
            type: NotificationType.basic
        };
        dispatch(setNotificationBase(baseNotification));
    }, [t, dispatch]);

    if (treeListQuery.error || userDataQuery.error) {
        return <ErrorDisplay message={treeListQuery.error.message || userDataQuery.error.message} />;
    }

    const treeList = treeListQuery.data?.trees?.list ?? [];
    const favoriteIds = userDataQuery.data?.userData?.data[FAVORITE_TREES_KEY] ?? [];

    const list: IListItem[] = treeList
        .map(tree => ({
            key: tree.id,
            id: tree.id,
            label: localizedTranslation(tree.label, lang),
            isFavorite: !!favoriteIds.includes(tree.id)
        }))
        .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));

    const columns: ColumnsType<IListItem> = [
        {
            title: t('home.label'),
            dataIndex: 'label',
            key: 'label',
            render: (label, item) => {
                return (
                    <TreeLink to={getTreeLink(item.id)}>
                        <TreeIcon style={{fontSize: '1.2rem'}} /> {label}
                    </TreeLink>
                );
            }
        },
        {
            dataIndex: 'isFavorite',
            key: 'isFavorite',
            width: 20,
            render: (isFavorite, item) => {
                const _handleFavoriteToggle = async (wasFavorite: boolean) => {
                    const {id} = item;

                    await updateFavoritesMutation({
                        variables: {
                            key: FAVORITE_TREES_KEY,
                            value: wasFavorite ? favoriteIds.filter(e => e !== id) : favoriteIds.concat([id]),
                            global: false
                        }
                    });
                };

                return (
                    <FavoriteStar
                        key="trees_favorites"
                        isFavorite={isFavorite}
                        onToggle={_handleFavoriteToggle}
                        hoverTrigger=".ant-table-row"
                    />
                );
            }
        }
    ];

    return (
        <div className="wrapper-page">
            <PageHeader
                avatar={{
                    icon: <TreeIcon style={{fontSize: '1.5rem'}} />,
                    shape: 'square',
                    style: {background: 'none', color: '#000'}
                }}
                title={t('home.trees')}
            />
            <Table bordered columns={columns} dataSource={list} loading={treeListQuery.loading} pagination={false} />
        </div>
    );
}

export default TreeList;
