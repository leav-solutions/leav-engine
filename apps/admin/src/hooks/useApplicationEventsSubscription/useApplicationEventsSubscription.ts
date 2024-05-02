// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSubscription} from '@apollo/client';
import {applicationDetailsFragment} from 'queries/applications/applicationDetailsFragment';
import {getApplicationsEventsSubscription} from 'queries/applications/getApplicationsEventsSubscription';
import {APPLICATION_EVENTS, APPLICATION_EVENTSVariables} from '_gqlTypes/APPLICATION_EVENTS';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';
import {ApplicationEventTypes} from '_gqlTypes/globalTypes';
import {WithTypename} from '../../../../../libs/utils/src/types/helpers';

const useApplicationEventsSubscription = (applicationId: string) =>
    useSubscription<APPLICATION_EVENTS, APPLICATION_EVENTSVariables>(getApplicationsEventsSubscription, {
        variables: {
            filters: {
                applicationId
            }
        },
        onSubscriptionData: ({client, subscriptionData}) => {
            // Update install status of saved app
            // if (
            //     subscriptionData?.data?.applicationEvent?.type !== ApplicationEventTypes.SAVE ||
            //     !subscriptionData?.data?.applicationEvent?.application
            // ) {
            //     return;
            // }
            // const appCacheId = client.cache.identify(
            //     subscriptionData.data.applicationEvent.application as WithTypename<GET_APPLICATIONS_applications_list>
            // );
            // const currentAppData = client.readFragment({
            //     id: appCacheId,
            //     fragment: applicationDetailsFragment
            // });
            // const newAppData = {
            //     ...currentAppData,
            //     install: subscriptionData.data.applicationEvent.application.install
            // };
            // client.writeFragment({
            //     id: appCacheId,
            //     data: newAppData,
            //     fragment: applicationDetailsFragment
            // });
        }
    });

export default useApplicationEventsSubscription;
