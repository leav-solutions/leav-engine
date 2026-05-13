import {gql} from '@apollo/client';
import {applicationDetailsFragment} from './applicationDetailsFragment';

export const saveApplicationMutation = gql`
    ${applicationDetailsFragment}
    mutation SAVE_APPLICATION($application: ApplicationInput!) {
        saveApplication(application: $application) {
            ...DetailsApplication
        }
    }
`;
