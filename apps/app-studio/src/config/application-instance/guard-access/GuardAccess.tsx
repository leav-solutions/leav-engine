import {type FunctionComponent, type PropsWithChildren} from 'react';
import {ErrorDisplay, ErrorDisplayTypes} from '@leav/ui';
import {useGetApplicationDataByEndpointQuery} from '../../../__generated__';
import {APP_ENDPOINT} from '../../../constants';

export const GuardAccess: FunctionComponent<PropsWithChildren> = ({children}) => {
    const {data} = useGetApplicationDataByEndpointQuery({
        variables: {endpoint: APP_ENDPOINT},
    });

    const currentApp = data?.applications?.list[0];

    if (!currentApp.permissions.access_application) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />;
    }

    return <>{children}</>;
};
