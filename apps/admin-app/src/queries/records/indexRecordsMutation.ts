// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const indexRecordsMutation = gql`
    mutation INDEX_RECORDS($libraryId: String!, $records: [String!]) {
        indexRecords(libraryId: $libraryId, records: $records)
    }
`;
