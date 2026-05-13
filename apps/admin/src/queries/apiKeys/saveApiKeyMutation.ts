import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

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
