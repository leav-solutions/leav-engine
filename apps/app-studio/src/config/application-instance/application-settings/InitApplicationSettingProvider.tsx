import {type FunctionComponent, type PropsWithChildren, useEffect, useState} from 'react';
import {type $ZodIssue} from 'zod/v4/core';
import {useTranslation} from 'react-i18next';
import {ErrorDisplay, Loading, usePanelEventHandlers} from '@leav/ui';
import {useGetApplicationDataByEndpointQuery} from '../../../__generated__';
import {type Application, type AppStudioInternalEvent} from '../../../modules/ApplicationRouting/types';
import {ApplicationSchema} from '../../../modules/ApplicationRouting/schema';
import {APP_ENDPOINT} from '../../../constants';
import {ApplicationSettingsContext} from './ApplicationSettingsContext';
import {updatePanelViewSettingsInApplication} from '../../../modules/ApplicationRouting/utils/updatePanelViewSettingsInApplication';

export const InitApplicationSettingProvider: FunctionComponent<PropsWithChildren> = ({children}) => {
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
        if (currentApp?.appStudioSettings) {
            const result = ApplicationSchema.safeParse(currentApp.appStudioSettings);

            if (result.success === false) {
                setParsingErrors(result.error.issues);
                return;
            }
            setApplication(result.data);
        }
    }, [currentApp?.appStudioSettings, setApplication, setParsingErrors]);

    usePanelEventHandlers<AppStudioInternalEvent>({
        'open-view-settings': ({currentLibraryId, currentViewId, explorerPanelDetails, selectedTab}) => {
            setApplication(prev =>
                updatePanelViewSettingsInApplication(prev, explorerPanelDetails, {
                    isViewSettingsActive: true,
                    selectedTab,
                    currentViewId,
                    targetLibraryId: currentLibraryId,
                }),
            );
        },
    });

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
