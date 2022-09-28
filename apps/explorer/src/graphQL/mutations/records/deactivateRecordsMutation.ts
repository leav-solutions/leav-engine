// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const deactivateRecordsMutation = gql`
    mutation DEACTIVATE_RECORDS($libraryId: String!, $recordsIds: [String!], $filters: [RecordFilterInput!]) {
        deactivateRecords(recordsIds: $recordsIds, filters: $filters, libraryId: $libraryId) {
            id
        }
    }
`;
