// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from '_ui/gqlFragments';

export const createDirectoryMutation = gql`
    ${recordIdentityFragment}
    mutation CREATE_DIRECTORY($library: String!, $nodeId: String!, $name: String!) {
        createDirectory(library: $library, nodeId: $nodeId, name: $name) {
            ...RecordIdentity
        }
    }
`;
