// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from '_ui/gqlFragments';

export const activateRecordsMutation = gql`
    ${recordIdentityFragment}
    mutation ACTIVATE_RECORDS($libraryId: String!, $recordsIds: [String!], $filters: [RecordFilterInput!]) {
        activateRecords(recordsIds: $recordsIds, filters: $filters, libraryId: $libraryId) {
            id
            ...RecordIdentity
        }
    }
`;
