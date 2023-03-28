// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSubscription} from '@apollo/client';
import {getApplicationsEventsSubscription} from 'queries/applications/getApplicationsEventsSubscription';
import {getApplicationsQuery} from 'queries/applications/getApplicationsQuery';
import {APPLICATION_EVENTS, APPLICATION_EVENTSVariables} from '_gqlTypes/APPLICATION_EVENTS';
import {GET_APPLICATIONS, GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';
import {ApplicationEventTypes} from '_gqlTypes/globalTypes';

const useApplicationEventsSubscription = () => {
    return useSubscription<APPLICATION_EVENTS, APPLICATION_EVENTSVariables>(getApplicationsEventsSubscription, {
        onSubscriptionData: ({client, subscriptionData}) => {
            const application = subscriptionData.data.applicationEvent.application;
            const appsList = client.cache.readQuery<GET_APPLICATIONS>({
                query: getApplicationsQuery,
                variables: {}
            });

            const appFromList = appsList?.applications.list.find(app => app.id === application.id);

            let newList: GET_APPLICATIONS_applications_list[];
            switch (subscriptionData.data.applicationEvent.type) {
                case ApplicationEventTypes.SAVE:
                    // If saved application is already in the list, replace it, otherwise add it to the list
                    newList = appFromList
                        ? appsList.applications.list.map(app => (app.id === application.id ? application : app))
                        : [...appsList.applications.list, application];
                    break;
                case ApplicationEventTypes.DELETE:
                    // Remove deleted application from the list
                    newList = appsList.applications.list.filter(app => app.id !== application.id);
                    break;
            }

            client.cache.writeQuery({
                query: getApplicationsQuery,
                variables: {},
                data: {
                    applications: {
                        ...appsList.applications,
                        list: newList
                    }
                }
            });
        }
    });
};

export default useApplicationEventsSubscription;
