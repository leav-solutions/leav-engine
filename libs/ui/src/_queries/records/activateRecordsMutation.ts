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
