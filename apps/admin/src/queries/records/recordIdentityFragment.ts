import {gql} from '@apollo/client';

export const recordIdentityFragment = gql`
    fragment RecordIdentity on Record {
        whoAmI {
            id
            library {
                id
                label
            }
            label
            color
            preview
        }
    }
`;
