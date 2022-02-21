// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import LibraryItemsList from 'components/LibraryItemsList';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {ErrorDisplayTypes} from 'components/shared/ErrorDisplay/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from 'hooks/LangHook/LangHook';
import useGetLibraryDetailExtendedQuery from 'hooks/useGetLibraryDetailExtendedQuery/useGetLibraryDetailExtendedQuery';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {setNotificationBase} from 'redux/notifications';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {localizedTranslation} from 'utils';
import {IBaseNotification, NotificationType, WorkspacePanels} from '_types/types';

export interface ILibraryHomeProps {
    library?: string;
}

function LibraryHome({library}: ILibraryHomeProps): JSX.Element {
    const [{lang}] = useLang();
    const {t} = useTranslation();
    const dispatch = useAppDispatch();
    const [activeLibrary, updateActiveLibrary] = useActiveLibrary();
    const {activePanel} = useAppSelector(state => state);

    const {loading, data, error} = useGetLibraryDetailExtendedQuery({library});

    const hasAccess = data?.libraries?.list[0]?.permissions.access_library;

    useEffect(() => {
        // Update infos about current lib (active library, notification message)
        if (
            loading ||
            error ||
            !data?.libraries?.list.length ||
            activePanel !== WorkspacePanels.LIBRARY ||
            !hasAccess
        ) {
            return;
        }

        const currentLibrary = data.libraries.list[0];
        const currentLibLabel = localizedTranslation(currentLibrary.label, lang);

        if (library !== activeLibrary?.id) {
            const {query, type, filter, searchableFields} = currentLibrary.gqlNames;
            const {attributes} = currentLibrary;

            updateActiveLibrary({
                id: library,
                name: currentLibLabel,
                filter,
                attributes,
                gql: {
                    searchableFields,
                    query,
                    type
                },
                trees: currentLibrary.linkedTrees,
                permissions: currentLibrary.permissions
            });
        }

        // Base Notification
        const baseNotification: IBaseNotification = {
            content: t('notification.active-lib', {lib: currentLibLabel}),
            type: NotificationType.basic
        };

        dispatch(setNotificationBase(baseNotification));
    }, [activeLibrary, data, dispatch, error, lang, library, loading, t, updateActiveLibrary, activePanel, hasAccess]);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!data?.libraries?.list.length) {
        return <ErrorDisplay message={t('lib_detail.not_found')} />;
    }

    if (!hasAccess) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} />;
    }

    return <LibraryItemsList selectionMode={false} library={data.libraries.list[0]} key={library} />;
}

export default LibraryHome;
