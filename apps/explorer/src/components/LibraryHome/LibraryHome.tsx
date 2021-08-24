// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {Spin} from 'antd';
import LibraryItemsList from 'components/LibraryItemsList';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {getLibraryDetailExtendedQuery} from 'graphQL/queries/libraries/getLibraryDetailExtendQuery';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {setNotificationBase} from 'redux/notifications';
import {useAppDispatch} from 'redux/store';
import styled from 'styled-components';
import {localizedTranslation} from 'utils';
import {GET_LIBRARY_DETAIL_EXTENDED, GET_LIBRARY_DETAIL_EXTENDEDVariables} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {IBaseNotification, NotificationType} from '_types/types';

const Loading = styled(Spin)`
    && {
        display: block;
        margin: 3em;
    }
`;

function LibraryHome(): JSX.Element {
    const {libId} = useParams<{libId: string}>();
    const [{lang}] = useLang();
    const [activeLibrary, updateActiveLibrary] = useActiveLibrary();
    const {t} = useTranslation();
    const dispatch = useAppDispatch();

    const {loading, data, error} = useQuery<GET_LIBRARY_DETAIL_EXTENDED, GET_LIBRARY_DETAIL_EXTENDEDVariables>(
        getLibraryDetailExtendedQuery,
        {
            variables: {
                libId
            }
        }
    );

    useEffect(() => {
        // Update infos about current lib (active library, notification message)
        if (loading || error || !data.libraries.list.length) {
            return;
        }

        const currentLibrary = data.libraries.list[0];
        const currentLibLabel = localizedTranslation(currentLibrary.label, lang);

        if (libId !== activeLibrary.id) {
            const {query, type, filter, searchableFields} = currentLibrary.gqlNames;

            updateActiveLibrary({
                id: libId,
                name: currentLibLabel,
                filter,
                gql: {
                    searchableFields,
                    query,
                    type
                }
            });
        }

        // Base Notification
        const baseNotification: IBaseNotification = {
            content: t('notification.active-lib', {lib: currentLibLabel}),
            type: NotificationType.basic
        };

        dispatch(setNotificationBase(baseNotification));
    }, [activeLibrary, data, dispatch, error, lang, libId, loading, t, updateActiveLibrary]);

    if (loading) {
        return <Loading size="large" />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!data.libraries.list.length) {
        return <ErrorDisplay message={t('lib_detail.not_found')} />;
    }

    return <LibraryItemsList selectionMode={false} library={data.libraries.list[0]} key={libId} />;
}

export default LibraryHome;
