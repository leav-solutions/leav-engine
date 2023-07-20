// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from 'graphql-tag';

const recordIdentityFragment = gql`
    fragment RecordIdentity on Record {
        id
        whoAmI {
            id
            label
            color
            library {
                id
                behavior
                label
                gqlNames {
                    query
                    type
                }
            }
            preview
        }
    }
`;

export default recordIdentityFragment;
