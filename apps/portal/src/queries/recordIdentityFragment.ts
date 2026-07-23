import {gql} from '@apollo/client';

const recordIdentityFragment = gql`
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

export default recordIdentityFragment;
