// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloudUploadOutlined, DatabaseOutlined} from '@ant-design/icons';
import {useMutation, useQuery} from '@apollo/client';
import {PageHeader, Table} from 'antd';
import {ColumnsType} from 'antd/lib/table';
import FloatingMenu from 'components/shared/FloatingMenu';
import {FloatingMenuAction} from 'components/shared/FloatingMenu/FloatingMenu';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {useLang} from 'hooks/LangHook/LangHook';
import useGetLibrariesListQuery from 'hooks/useGetLibrariesListQuery/useGetLibrariesListQuery';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {setNotificationBase} from 'redux/notifications';
import {useAppDispatch} from 'redux/store';
import styled from 'styled-components';
import {getLibraryLink, localizedTranslation} from 'utils';
import {GET_LIBRARIES_LIST_libraries_list} from '_gqlTypes/GET_LIBRARIES_LIST';
import {GET_USER_DATA, GET_USER_DATAVariables} from '_gqlTypes/GET_USER_DATA';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '../../../_gqlTypes/SAVE_USER_DATA';
import {IBaseNotification, NotificationType} from '../../../_types/types';
import ErrorDisplay from '../../shared/ErrorDisplay';
import FavoriteStar from '../FavoriteStar';
import ImportModal from './ImportModal';
import LibraryIcon from './LibraryIcon';

export const FAVORITE_LIBRARIES_KEY = 'favorites_libraries_ids';

const LibraryLink = styled(Link)`
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
    behavior: GET_LIBRARIES_LIST_libraries_list['behavior'];
    icon: GET_LIBRARIES_LIST_libraries_list['icon'];
    isFavorite: boolean;
}

const Wrapper = styled.div`
    & table .label-cell:not(:hover) .floating-menu {
        display: none;
    }
`;

function LibrariesList(): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();

    const dispatch = useAppDispatch();
    const [importActiveLibrary, setImportActiveLibrary] = useState<string>();

    const librariesListQuery = useGetLibrariesListQuery();
    const userDataQuery = useQuery<GET_USER_DATA, GET_USER_DATAVariables>(getUserDataQuery, {
        variables: {keys: [FAVORITE_LIBRARIES_KEY]}
    });

    const [updateFavoritesMutation] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData);

    useEffect(() => {
        const baseNotification: IBaseNotification = {
            content: t('notification.base-message'),
            type: NotificationType.basic
        };
        dispatch(setNotificationBase(baseNotification));
    }, [t, dispatch]);

    if (librariesListQuery.error || userDataQuery.error) {
        return <ErrorDisplay message={librariesListQuery.error?.message || userDataQuery.error?.message} />;
    }

    const libraries = librariesListQuery.data?.libraries?.list ?? [];
    const favoriteIds = userDataQuery.data?.userData?.data[FAVORITE_LIBRARIES_KEY] ?? [];

    const list: IListItem[] = libraries
        .map(library => ({
            key: library.id,
            id: library.id,
            behavior: library.behavior,
            icon: library.icon,
            label: localizedTranslation(library.label, lang),
            isFavorite: favoriteIds.includes(library.id)
        }))
        .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));

    const columns: ColumnsType<IListItem> = [
        {
            title: t('home.label'),
            dataIndex: 'label',
            key: 'label',
            className: 'label-cell',
            render: (label, item) => {
                const actions: FloatingMenuAction[] = [
                    {
                        title: t('import.title'),
                        icon: <CloudUploadOutlined size={20} />,
                        onClick: () => setImportActiveLibrary(item.id)
                    }
                ];

                return (
                    <LibraryLink to={getLibraryLink(item.id)}>
                        <LibraryIcon library={item} /> {label}
                        <FloatingMenu style={{right: '28px'}} actions={actions} />
                    </LibraryLink>
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
                            key: FAVORITE_LIBRARIES_KEY,
                            value: wasFavorite ? favoriteIds.filter(e => e !== id) : favoriteIds.concat([id]),
                            global: false
                        }
                    });
                };

                return (
                    <FavoriteStar
                        key="libraries_favorites"
                        isFavorite={isFavorite}
                        onToggle={_handleFavoriteToggle}
                        hoverTrigger=".ant-table-row"
                    />
                );
            }
        }
    ];

    return (
        <Wrapper className="wrapper-page">
            <PageHeader
                avatar={{
                    icon: <DatabaseOutlined style={{fontSize: '1.5rem'}} />,
                    shape: 'square',
                    style: {background: 'none', color: '#000'}
                }}
                title={t('home.libraries')}
            />
            <Table
                bordered
                columns={columns}
                dataSource={list}
                loading={librariesListQuery.loading}
                pagination={false}
            />
            {importActiveLibrary && (
                <ImportModal
                    open={!!importActiveLibrary}
                    library={importActiveLibrary}
                    onClose={() => setImportActiveLibrary('')}
                />
            )}
        </Wrapper>
    );
}

export default LibrariesList;
