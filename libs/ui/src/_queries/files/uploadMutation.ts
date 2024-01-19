// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

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
