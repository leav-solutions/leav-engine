// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext, type FunctionComponent, useContext, useEffect, useState} from 'react';
import {type $ZodIssue} from 'zod/v4/core';
import {useTranslation} from 'react-i18next';
import {ErrorDisplay, Loading} from '@leav/ui';
import {useGetApplicationDataByEndpointQuery} from '../../../__generated__';
import {type Application} from '../../../modules/ApplicationRouting/types';
import {ApplicationSchema} from '../../../modules/ApplicationRouting/schema';
import {APP_ENDPOINT} from '../../../constants';

const ApplicationSettingsContext = createContext<ReturnType<typeof useState<Application | null>>>(null);

export const useApplicationSettingsContext = () => useContext(ApplicationSettingsContext);

export const InitApplicationSettingProvider: FunctionComponent = ({children}) => {
    const {t} = useTranslation();

    const {
        data,
        loading,
        error: networkError,
    } = useGetApplicationDataByEndpointQuery({
        variables: {endpoint: APP_ENDPOINT},
    });

    const currentApp = data?.applications?.list[0];

    const applicationState = useState<Application | null>(null);
    const [, setApplication] = applicationState;
    const [parsingErrors, setParsingErrors] = useState<$ZodIssue[] | null>(null);

    useEffect(() => {
        if (currentApp?.settings) {
            const result = ApplicationSchema.safeParse(currentApp.settings.application);

            if (result.success === false) {
                setParsingErrors(result.error.issues);
                return;
            }
            setApplication(result.data);
        }
    }, [currentApp?.settings, setApplication, setParsingErrors]);

    if (loading) {
        return <Loading />;
    }

    if (networkError) {
        return <ErrorDisplay message={networkError.message} />;
    }

    if (parsingErrors) {
        return <ErrorDisplay message={JSON.stringify(parsingErrors)} />;
    }

    if (!currentApp) {
        return <ErrorDisplay message={t('applications.current_app_error', {appId: APP_ENDPOINT})} />;
    }

    return (
        <ApplicationSettingsContext.Provider value={applicationState}>{children}</ApplicationSettingsContext.Provider>
    );
};
