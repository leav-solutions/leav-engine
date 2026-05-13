import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../../gqlFragments';

const createRecordMutation = gql`
    ${recordIdentityFragment}
    mutation CREATE_RECORD($library: ID!, $skipActivate: Boolean, $data: CreateRecordDataInput) {
        createRecord(library: $library, skipActivate: $skipActivate, data: $data) {
            record {
                ...RecordIdentity
            }
            valuesErrors {
                type
                attribute
                input
                message
            }
        }
    }
`;

export default createRecordMutation;
