import {gql} from '@apollo/client';

export const purgeRecordsMutation = gql`
    mutation PURGE_RECORDS($libraryId: String!) {
        purgeInactiveRecords(libraryId: $libraryId) {
            id
        }
    }
`;
