import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const getApiKeysQuery = gql`
    ${recordIdentityFragment}
    query GET_API_KEYS($filters: ApiKeysFiltersInput, $sort: SortApiKeysInput) {
        apiKeys(filters: $filters, sort: $sort) {
            list {
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
    }
`;
