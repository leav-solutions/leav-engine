import {gql} from '@apollo/client';
import {recordIdentityFragment} from './recordIdentityFragment';

export const createRecordQuery = gql`
    ${recordIdentityFragment}
    mutation CREATE_RECORD($library: ID!) {
        createRecord(library: $library) {
            record {
                id
                ...RecordIdentity
            }
        }
    }
`;
