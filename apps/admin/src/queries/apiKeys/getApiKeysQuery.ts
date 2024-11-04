// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

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
