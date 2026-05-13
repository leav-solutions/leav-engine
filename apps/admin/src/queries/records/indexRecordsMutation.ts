import {gql} from '@apollo/client';

export const indexRecordsMutation = gql`
    mutation INDEX_RECORDS($libraryId: String!, $records: [String!]) {
        indexRecords(libraryId: $libraryId, records: $records)
    }
`;
