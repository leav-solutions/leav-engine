// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery, useSubscription} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {ErrorDisplayTypes} from 'components/shared/ErrorDisplay/ErrorDisplay';
import Loading from 'components/shared/Loading';
import ApplicationContext from 'context/ApplicationContext';
import {getApplicationByIdQuery} from 'graphQL/queries/applications/getApplicationByIdQuery';
import {getGlobalSettingsQuery} from 'graphQL/queries/globalSettings/getGlobalSettingsQuery';
import {getTasks} from 'graphQL/queries/tasks/getTasks';
import {getTaskUpdates} from 'graphQL/subscribes/tasks/getTaskUpdates';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppDispatch} from 'redux/store';
import {addTask} from 'redux/tasks';
import {GET_APPLICATION_BY_ID, GET_APPLICATION_BY_IDVariables} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {GET_GLOBAL_SETTINGS} from '_gqlTypes/GET_GLOBAL_SETTINGS';
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
    const dispatch = useAppDispatch();

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

    const {
        data: globalSettingsData,
        loading: globalSettingsLoading,
        error: globalSettingsError
    } = useQuery<GET_GLOBAL_SETTINGS>(getGlobalSettingsQuery);

    const currentApp = applicationData?.applications?.list?.[0];
    const globalSettings = globalSettingsData?.globalSettings;

    const {error: tasksError} = useQuery(getTasks, {
        variables: {
            filters: {
                created_by: userData?.me?.id,
                archive: false
            }
        },
        skip: !userData?.me?.id,
        onCompleted: data => {
            for (const task of data.tasks.list) {
                dispatch(addTask(task));
            }
        }
    });

    useSubscription(getTaskUpdates, {
        variables: {filters: {created_by: userData?.me?.id, archive: false}},
        skip: !userData?.me?.id,
        onSubscriptionData: subData => {
            // we temporary add created_by field because of miss context for subscriptions on server side to resolve User object
            const task = subData.subscriptionData.data.task;
            dispatch(addTask(task));
        }
    });

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
                userPermissions: {},
                userWhoAmI: userData?.me?.whoAmI
            }); // FIXME: permissions ??
        }
    }, [updateUser, user, meLoading, userData]);

    useEffect(() => {
        if (!globalSettings || !currentApp) {
            return;
        }

        document.title = `${globalSettings.name} - ${localizedTranslation(currentApp.label, lang)}`;
    }, [currentApp, globalSettings, langInfo.lang, t]);

    if (meLoading || applicationLoading || globalSettingsLoading) {
        return <Loading />;
    }

    if (meError || tasksError || applicationError || globalSettingsError) {
        const error = meError || tasksError || applicationError || globalSettingsError;
        return <ErrorDisplay message={error?.message} />;
    }

    if (!currentApp) {
        return <ErrorDisplay message={t('applications.current_app_error', {appId})} />;
    }

    if (!currentApp.permissions.access_application) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />;
    }

    const appContextData = {
        currentApp,
        globalSettings
    };

    return (
        <ApplicationContext.Provider value={appContextData}>
            <Router />
        </ApplicationContext.Provider>
    );
}

export default AppHandler;
