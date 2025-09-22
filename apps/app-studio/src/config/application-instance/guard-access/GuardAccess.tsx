// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {ErrorDisplay, ErrorDisplayTypes} from '@leav/ui';
import {useGetApplicationInstanceDataByEndpointQuery} from '../../../__generated__';
import {APP_ENDPOINT} from '../../../constants';

export const GuardAccess: FunctionComponent = ({children}) => {
    const {data} = useGetApplicationInstanceDataByEndpointQuery({
        variables: {endpoint: APP_ENDPOINT}
    });

    const currentApp = data?.applications?.list[0];

    if (!currentApp.permissions.access_application) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />;
    }

    return <>{children}</>;
};
