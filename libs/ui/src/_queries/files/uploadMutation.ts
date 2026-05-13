import {gql} from '@apollo/client';
import {recordIdentityFragment} from '_ui/gqlFragments';

export const uploadMutation = gql`
    ${recordIdentityFragment}
    mutation UPLOAD($library: String!, $nodeId: String!, $files: [FileInput!]!) {
        upload(library: $library, nodeId: $nodeId, files: $files) {
            uid
            record {
                ...RecordIdentity
            }
        }
    }
`;
