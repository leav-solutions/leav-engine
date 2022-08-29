// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

export const saveApplicationMutation = gql`
    ${recordIdentityFragment}
    mutation SAVE_APPLICATION($application: ApplicationInput!) {
        saveApplication(application: $application) {
            id
            color
            module
            description
            endpoint
            label
            system
            icon {
                ...RecordIdentity
            }
        }
    }
`;
