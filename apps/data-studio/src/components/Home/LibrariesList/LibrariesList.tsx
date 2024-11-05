// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloudUploadOutlined, DatabaseOutlined} from '@ant-design/icons';
import {useMutation, useQuery} from '@apollo/client';
import {ErrorDisplay, FloatingMenu, FloatingMenuAction, ImportModal, Loading, useLang} from '@leav/ui';
import {Table} from 'antd';
import {ColumnsType} from 'antd/lib/table';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {useApplicationLibraries} from 'hooks/useApplicationLibraries';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import {getLibraryLink, localizedTranslation} from 'utils';
import {GET_LIBRARIES_LIST_libraries_list} from '_gqlTypes/GET_LIBRARIES_LIST';
import {GET_USER_DATA, GET_USER_DATAVariables} from '_gqlTypes/GET_USER_DATA';
import {FAVORITE_LIBRARIES_KEY} from '../../../constants';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '../../../_gqlTypes/SAVE_USER_DATA';
import FavoriteStar from '../FavoriteStar';
import LibraryIcon from './LibraryIcon';

const LibraryLink = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
    width: 100%;
    color: inherit;
`;

const ListHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1rem;
    font-weight: bold;
    font-size: 1.2em;
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
    const {lang} = useLang();

    const [importActiveLibrary, setImportActiveLibrary] = useState<string>();

    const {libraries, loading: librariesLoading, error: librariesError} = useApplicationLibraries();
    const userDataQuery = useQuery<GET_USER_DATA, GET_USER_DATAVariables>(getUserDataQuery, {
        variables: {keys: [FAVORITE_LIBRARIES_KEY]}
    });

    const [updateFavoritesMutation] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData);

    if (librariesLoading || userDataQuery.loading) {
        return <Loading />;
    }

    if (librariesError || userDataQuery.error) {
        return <ErrorDisplay message={librariesError || userDataQuery.error?.message} />;
    }

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
            title: <></>,
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

    if (!librariesLoading && !libraries.length) {
        return null;
    }

    return (
        <Wrapper className="wrapper-page" data-testid="libraries-list">
            <ListHeader>
                <DatabaseOutlined style={{fontSize: '1.5rem'}} />
                {t('home.libraries')}
            </ListHeader>
            <Table bordered columns={columns} dataSource={list} loading={librariesLoading} pagination={false} />
            {importActiveLibrary && (
                <ImportModal
                    open={!!importActiveLibrary}
                    library={importActiveLibrary}
                    onClose={() => setImportActiveLibrary('')}
                    availableLibraries={libraries}
                />
            )}
        </Wrapper>
    );
}

export default LibrariesList;
