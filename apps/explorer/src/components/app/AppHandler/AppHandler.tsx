// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {ErrorDisplayTypes} from 'components/shared/ErrorDisplay/ErrorDisplay';
import Loading from 'components/shared/Loading';
import ApplicationContext from 'context/ApplicationContext';
import {getApplicationByIdQuery} from 'graphQL/queries/applications/getApplicationByIdQuery';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {GET_APPLICATION_BY_ID, GET_APPLICATION_BY_IDVariables} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {getMe} from '../../../graphQL/queries/userData/me';
import {initialActiveLibrary, useActiveLibrary} from '../../../hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from '../../../hooks/LangHook/LangHook';
import {useUser} from '../../../hooks/UserHook/UserHook';
import {getSysTranslationQueryLanguage} from '../../../utils';
import {ME} from '../../../_gqlTypes/ME';
import {AvailableLanguage} from '../../../_types/types';
import Router from '../../Router';

function AppHandler(): JSX.Element {
    const {t, i18n} = useTranslation();

    // Add lang infos to the cache
    const lang = getSysTranslationQueryLanguage(i18n);
    const availableLangs = process.env.REACT_APP_AVAILABLE_LANG
        ? process.env.REACT_APP_AVAILABLE_LANG.split(',').map(l => AvailableLanguage[l as AvailableLanguage])
        : [];
    const appId = process.env.REACT_APP_APPLICATION_ID;

    // Depending on browser, user language might be "fr" or "fr-FR".
    // We don't handle sub-language, thus extract first part only (eg. 'fr')
    const defaultLang = AvailableLanguage?.[i18n.language.split('-')[0]] ?? AvailableLanguage.en;

    const [langInfo, updateLang] = useLang();
    const [activeLibrary, updateActiveLibrary] = useActiveLibrary();
    const [user, updateUser] = useUser();
    const {data: userData, loading: meLoading, error: meError} = useQuery<ME>(getMe);
    const {data: applicationData, loading: applicationLoading, error: applicationError} = useQuery<
        GET_APPLICATION_BY_ID,
        GET_APPLICATION_BY_IDVariables
    >(getApplicationByIdQuery, {variables: {id: appId ?? ''}});

    useEffect(() => {
        if (!langInfo.lang.length) {
            updateLang({lang, availableLangs, defaultLang});
        }
    }, [updateLang, langInfo.lang, lang, availableLangs, defaultLang]);

    useEffect(() => {
        if (!activeLibrary) {
            updateActiveLibrary(initialActiveLibrary);
        }
    }, [updateActiveLibrary, activeLibrary]);

    useEffect(() => {
        if (!user && userData && !meLoading) {
            updateUser({
                userId: userData.me.id,
                userName: userData.me.whoAmI?.label || userData.me.login,
                userPermissions: {}
            }); // FIXME: permissions ??
        }
    }, [updateUser, user, meLoading, userData]);

    if (meLoading || applicationLoading) {
        return <Loading />;
    }

    if (meError || applicationError) {
        return <ErrorDisplay message={meError?.message || applicationError?.message} />;
    }

    const currentApp = applicationData?.applications?.list?.[0];

    if (!currentApp) {
        return <ErrorDisplay message={t('applications.current_app_error', {appId})} />;
    }

    if (!currentApp.permissions.access_application) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />;
    }

    return (
        <ApplicationContext.Provider value={currentApp}>
            <ErrorBoundary>
                <Router />
            </ErrorBoundary>
        </ApplicationContext.Provider>
    );
}

export default AppHandler;
