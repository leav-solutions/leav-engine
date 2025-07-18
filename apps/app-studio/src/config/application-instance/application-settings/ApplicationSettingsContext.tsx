// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext, FunctionComponent, useContext, useEffect, useState} from 'react';
import {$ZodIssue} from 'zod/v4/core';
import {useTranslation} from 'react-i18next';
import {APP_ENDPOINT, ErrorDisplay, Loading} from '@leav/ui';
import {useGetApplicationInstanceDataByEndpointQuery} from '../../../__generated__';
import {Application} from '../../../modules/ApplicationRouting/types';
import {ApplicationSchema} from '../../../modules/ApplicationRouting/schema';

const ApplicationSettingsContext = createContext<ReturnType<typeof useState<Application | null>>>(null);

export const useApplicationSettingsContext = () => useContext(ApplicationSettingsContext);

export const InitApplicationSettingProvider: FunctionComponent = ({children}) => {
    const {t} = useTranslation();

    const {data, loading, error} = useGetApplicationInstanceDataByEndpointQuery({
        variables: {endpoint: APP_ENDPOINT}
    });

    const currentApp = data?.applications?.list[0];

    const applicationState = useState<Application | null>(null);
    const [, setApplication] = applicationState;
    const [errorsOnParsing, setErrorsOnParsing] = useState<$ZodIssue[] | null>(null);
    useEffect(() => {
        if (currentApp?.settings) {
            const result = ApplicationSchema.safeParse(currentApp.settings);

            if (result.success === false) {
                setErrorsOnParsing(result.error.issues);
                return;
            }
            setApplication(result.data);
        }
    }, [currentApp?.settings, setApplication, setErrorsOnParsing]);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (errorsOnParsing) {
        return <ErrorDisplay message={JSON.stringify(errorsOnParsing)} />;
    }

    if (!currentApp) {
        return <ErrorDisplay message={t('applications.current_app_error', {appId: APP_ENDPOINT})} />;
    }

    return (
        <ApplicationSettingsContext.Provider value={applicationState}>{children}</ApplicationSettingsContext.Provider>
    );
};
