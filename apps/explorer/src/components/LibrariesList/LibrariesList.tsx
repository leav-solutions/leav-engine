// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import {Divider, PageHeader, Row, Spin} from 'antd';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {setNotificationBase} from 'redux/notifications';
import {useAppDispatch} from 'redux/store';
import {getLibrariesListQuery} from '../../graphQL/queries/libraries/getLibrariesListQuery';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '../../_gqlTypes/SAVE_USER_DATA';
import {IBaseNotification, NotificationType} from '../../_types/types';
import ErrorDisplay from '../shared/ErrorDisplay';
import LibraryCard from './LibraryCard';
import LibraryDetail from './LibraryDetail';

export const FAVORITE_LIBRARIES_KEY = 'favorites_libraries_ids';

function LibrariesList(): JSX.Element {
    const {t} = useTranslation();
    const {libId, libQueryName, filterName} = useParams<{libId: string; libQueryName: string; filterName: string}>();

    const dispatch = useAppDispatch();

    const [activeLibrary, setActiveLibrary] = useState<string>(libId);

    const librariesListQuery = useQuery(getLibrariesListQuery);
    const userDataQuery = useQuery(getUserDataQuery, {
        variables: {key: FAVORITE_LIBRARIES_KEY}
    });

    const [updateFavoritesMutation] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData, {
        refetchQueries: [
            {
                query: getUserDataQuery,
                variables: {key: FAVORITE_LIBRARIES_KEY}
            }
        ]
    });

    const onUpdateFavorite = async (id: string) => {
        await updateFavoritesMutation({
            variables: {
                key: FAVORITE_LIBRARIES_KEY,
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

    useEffect(() => {
        setActiveLibrary(libId);
    }, [libId, setActiveLibrary]);

    if (librariesListQuery.loading || userDataQuery.loading) {
        return <Spin />;
    }

    if (librariesListQuery.error || userDataQuery.error) {
        return <ErrorDisplay message={librariesListQuery.error?.message || userDataQuery.error?.message} />;
    }

    const libraries = librariesListQuery.data?.libraries?.list ?? [];
    const favoriteIds = userDataQuery.data?.userData?.data ?? [];

    return (
        <div className="wrapper-page">
            <PageHeader title={t('lib_list.header')} />
            <Row gutter={[16, 16]}>
                {libraries
                    .filter(lib => favoriteIds.includes(lib.id))
                    .map(lib => (
                        <LibraryCard
                            active={lib.id === activeLibrary}
                            key={lib.id}
                            lib={lib}
                            isFavorite={true}
                            onUpdateFavorite={onUpdateFavorite}
                        />
                    ))}
            </Row>
            {favoriteIds.length > 0 && <Divider />}
            <Row gutter={[16, 16]}>
                {libraries
                    .filter(lib => !favoriteIds.includes(lib.id))
                    .map(lib => (
                        <LibraryCard
                            active={lib.id === activeLibrary}
                            key={lib.id}
                            lib={lib}
                            onUpdateFavorite={onUpdateFavorite}
                        />
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
