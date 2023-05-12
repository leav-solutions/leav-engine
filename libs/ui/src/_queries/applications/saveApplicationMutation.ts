// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
