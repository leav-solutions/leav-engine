import {localizedTranslation} from '@leav/utils';
import ErrorDisplay from '../../shared/ErrorDisplay';
import ApplicationContext from '../../../context/CurrentApplicationContext';
import {type ICurrentApplicationContext} from '../../../context/CurrentApplicationContext/_types';
import useAppLang from '../../../hooks/useAppLang/useAppLang';
import {useEffect, useState} from 'react';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {useTranslation} from 'react-i18next';
import {Message} from 'semantic-ui-react';
import * as yup from 'yup';
import {ErrorDisplayTypes} from '../../../_types/errors';
import {APP_ENDPOINT} from '../../../constants';
import {getSysTranslationQueryLanguage, permsArrayToObject} from '../../../utils/utils';
import LangContext from '../../shared/LangContext';
import {LangContext as LeavUILangContext} from '_ui/contexts';
import Loading from '../../shared/Loading';
import UserContext from '../../shared/UserContext';
import {type IUserContext} from '../../shared/UserContext/UserContext';
import Home from '../Home';
import MessagesDisplay from '../MessagesDisplay';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {
    AvailableLanguage,
    PermissionsActions,
    PermissionTypes,
    useGetApplicationByEndpointQuery,
    useGetGlobalSettingsQuery,
    useGetLangsQuery,
    useIsAllowedQuery,
    useMeQuery,
} from '../../../_gqlTypes';
import {type GET_APPLICATION_BY_ID_applications_list} from '../../../_gqlTypes/GET_APPLICATION_BY_ID';
import {type GET_GLOBAL_SETTINGS_globalSettings} from '../../../_gqlTypes/GET_GLOBAL_SETTINGS';
import {type IS_ALLOWED_isAllowed} from '../../../_gqlTypes/IS_ALLOWED';
import {type RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';

const App = (): JSX.Element => {
    const {t, i18n} = useTranslation();
    const {lang: appLang, loading: appLangLoading, error: appLangErr} = useAppLang();
    const {data: meData, loading: meLoading, error: meError} = useMeQuery();

    const {
        loading: isAllowedLoading,
        error: isAllowedError,
        data: isAllowedData,
    } = useIsAllowedQuery({
        variables: {
            type: PermissionTypes.admin,
            actions: Object.values(PermissionsActions).filter(a => !!a.match(/^admin_/)),
        },
    });

    const {data: availableLangs, loading: langsLoading, error: langsError} = useGetLangsQuery();

    const {
        data: applicationData,
        loading: applicationLoading,
        error: applicationError,
    } = useGetApplicationByEndpointQuery({
        variables: {endpoint: APP_ENDPOINT},
    });

    const {
        data: globalSettingsData,
        loading: globalSettingsLoading,
        error: globalSettingsError,
    } = useGetGlobalSettingsQuery();
    const [lang, setLang] = useState<AvailableLanguage[]>(getSysTranslationQueryLanguage(i18n));

    const currentApp = applicationData?.applications?.list?.[0];
    const globalSettings = globalSettingsData?.globalSettings;

    useEffect(() => {
        dayjs.extend(duration);
    }, []);

    useEffect(() => {
        if (!globalSettings || !currentApp) {
            return;
        }

        document.title = `${globalSettings.name} - ${localizedTranslation(currentApp.label, lang)}`;
    }, [currentApp, globalSettings, lang, t]);

    // Load yup messages translations
    yup.setLocale({
        string: {matches: t('admin.validation_errors.matches')},
        array: {
            min: t('admin.validation_errors.min'),
        },
        mixed: {
            required: t('admin.validation_errors.required'),
        },
    });

    if (
        isAllowedLoading ||
        meLoading ||
        applicationLoading ||
        globalSettingsLoading ||
        langsLoading ||
        appLangLoading
    ) {
        return <Loading style={{margin: '15rem'}} />;
    }

    if (
        isAllowedError ||
        meError ||
        applicationError ||
        globalSettingsError ||
        (!isAllowedLoading && !isAllowedData?.isAllowed) ||
        (!meLoading && !meData?.me) ||
        appLangErr ||
        langsError
    ) {
        return (
            <Message negative style={{margin: '2em'}}>
                {isAllowedError?.message ??
                    meError?.message ??
                    applicationError?.message ??
                    globalSettingsError?.message ??
                    appLangErr ??
                    t('errors.INTERNAL_ERROR')}
            </Message>
        );
    }

    if (!currentApp) {
        return <ErrorDisplay message={t('applications.current_app_error', {appId: currentApp.id})} />;
    }

    if (!currentApp.permissions.access_application) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />;
    }

    const userData: IUserContext = {
        id: meData.me.whoAmI.id,
        whoAmI: meData.me.whoAmI as RecordIdentity_whoAmI,
        permissions: permsArrayToObject(isAllowedData.isAllowed as IS_ALLOWED_isAllowed[]),
    };

    const applicationContextData: ICurrentApplicationContext = {
        currentApp: currentApp as GET_APPLICATION_BY_ID_applications_list,
        globalSettings: globalSettingsData?.globalSettings as GET_GLOBAL_SETTINGS_globalSettings,
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <LangContext.Provider
                value={{
                    lang,
                    availableLangs: availableLangs.langs.map(l => AvailableLanguage[l]),
                    defaultLang: AvailableLanguage[appLang],
                    setLang,
                }}
            >
                <LeavUILangContext.Provider
                    value={{
                        lang,
                        availableLangs: availableLangs.langs,
                        defaultLang: appLang,
                        setLang: (newLang: string) => setLang([newLang as AvailableLanguage]),
                    }}
                >
                    <UserContext.Provider value={userData}>
                        <ApplicationContext.Provider value={applicationContextData}>
                            <div className="App height100">
                                <MessagesDisplay />
                                <Home />
                            </div>
                        </ApplicationContext.Provider>
                    </UserContext.Provider>
                </LeavUILangContext.Provider>
            </LangContext.Provider>
        </DndProvider>
    );
};

export default App;
