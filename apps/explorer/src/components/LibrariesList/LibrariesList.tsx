// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery, useMutation} from '@apollo/client';
import {Divider, PageHeader, Row, Spin} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {useNotifications} from '../../hooks/NotificationsHook/NotificationsHook';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';
import {getUserDataQuery} from '../../queries/userData/getUserData';
import {saveUserData} from '../../queries/userData/saveUserData';
import {NotificationType} from '../../_types/types';
import LibraryCard from './LibraryCard';
import LibraryDetail from './LibraryDetail';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '../../_gqlTypes/SAVE_USER_DATA';
import ErrorDisplay from '../shared/ErrorDisplay';

export const FAVORITE_LIBRARIES_KEY = 'favorites_libraries_ids';

function LibrariesList(): JSX.Element {
    const {t} = useTranslation();
    const {libId, libQueryName, filterName} = useParams<{libId: string; libQueryName: string; filterName: string}>();
    const {updateBaseNotification} = useNotifications();

    const [activeLibrary, setActiveLibrary] = useState<string>(libId);

    const librariesListQuery  = useQuery(getLibrariesListQuery);
    const userDataQuery = useQuery(getUserDataQuery, {
        variables: {key: FAVORITE_LIBRARIES_KEY}
    });

    const [updateFavoritesMutation] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData, {
        refetchQueries: [{
            query: getUserDataQuery,
            variables: {key: FAVORITE_LIBRARIES_KEY}}]
    });

    const onUpdateFavorite = async (id: string) =>  {
            await updateFavoritesMutation({variables: {
                key: FAVORITE_LIBRARIES_KEY,
                value: favoriteIds.includes(id)
                    ? favoriteIds.filter(e => e !== id)
                    : favoriteIds.concat([id]),
                global: false
            }});
    };

    useEffect(() => {
        updateBaseNotification({content: t('notification.base-message'), type: NotificationType.basic});
    }, [updateBaseNotification, t]);

    useEffect(() => {
        setActiveLibrary(libId);
    }, [libId, setActiveLibrary]);

    if (librariesListQuery.loading || userDataQuery.loading) {
        return <Spin />;
    }

    if (librariesListQuery.error || userDataQuery.error) {
        return <ErrorDisplay message={librariesListQuery.error.message ||  userDataQuery.error.message} />;
    }

    const libraries = librariesListQuery.data?.libraries?.list ?? [];
    const favoriteIds = userDataQuery.data?.userData?.data ?? [];

    return (
        <div className="wrapper-page">
            <PageHeader title={t('lib_list.header')} />
            <Row gutter={[16, 16]}>
                {libraries.filter(lib => favoriteIds.includes(lib.id)).map(lib => (
                    <LibraryCard active={lib.id === activeLibrary} key={lib.id} lib={lib} isFavorite={true} onUpdateFavorite={onUpdateFavorite}/>
                ))}
            </Row>
            {favoriteIds.length > 0 && <Divider />}
            <Row gutter={[16, 16]}>
                {libraries.filter(lib => !favoriteIds.includes(lib.id)).map(lib => (
                    <LibraryCard active={lib.id === activeLibrary} key={lib.id} lib={lib} onUpdateFavorite={onUpdateFavorite} />
                ))}
            </Row>
            {libId && libQueryName && (
                <>
                    <Divider />
                    <LibraryDetail libId={libId} libQueryName={libQueryName} filterName={filterName} />
                </>
            )}
        </div>
    );
}

export default LibrariesList;
