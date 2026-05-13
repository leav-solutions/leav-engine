import {gql} from '@apollo/client';

export const recordIdentityFragment = gql`
    fragment RecordIdentity on Record {
        id
        whoAmI {
            id
            label
            subLabel
            color
            library {
                id
                label
            }
            preview
        }
    }
`;
