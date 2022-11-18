// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

export const saveApiKeyMutation = gql`
    ${recordIdentityFragment}
    mutation SAVE_API_KEY($apiKey: ApiKeyInput!) {
        saveApiKey(apiKey: $apiKey) {
            id
            label
            key
            expiresAt
            createdBy {
                ...RecordIdentity
            }
            createdAt
            modifiedBy {
                ...RecordIdentity
            }
            modifiedAt
            user {
                ...RecordIdentity
            }
        }
    }
`;
