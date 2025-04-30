// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect} from 'react';
import {localizedTranslation} from '@leav/utils';
import {ErrorDisplay, ErrorDisplayTypes, Loading} from '@leav/ui';
import {useGetApplicationPermissionAndNameQuery} from '../../__generated__';

export const GuardApplicationAccess: FunctionComponent = ({children}) => {
    const {
        data: applicationData,
        loading: applicationLoading,
        error: applicationError
    } = useGetApplicationPermissionAndNameQuery();

    const currentApp = applicationData?.applications?.list?.[0];

    useEffect(() => {
        if (!currentApp) {
            return;
        }

        // TODO: improve as any casting
        // TODO: change responsibility to avoid mixing guard and display
        document.title = localizedTranslation(currentApp.label, 'fr' as any);
    }, [currentApp]);

    if (applicationLoading) {
        return <Loading />;
    }

    if (applicationError) {
        return <ErrorDisplay message={applicationError?.message} />;
    }

    if (!currentApp) {
        return <ErrorDisplay message={'todo' /*TODO: t('applications.current_app_error', {appId: currentApp.id})*/} />;
    }

    if (!currentApp?.permissions?.access_application) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />;
    }

    return <>{children}</>;
};
