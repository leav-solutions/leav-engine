// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from '_ui/gqlFragments';

export const deactivateRecordsMutation = gql`
    ${recordIdentityFragment}
    mutation DEACTIVATE_RECORDS($libraryId: String!, $recordsIds: [String!], $filters: [RecordFilterInput!]) {
        deactivateRecords(recordsIds: $recordsIds, filters: $filters, libraryId: $libraryId) {
            id
            ...RecordIdentity
        }
    }
`;
