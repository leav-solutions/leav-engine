import gql from 'graphql-tag';

export const recordIdentityFragment = gql`
    fragment RecordIdentity on Record {
        whoAmI {
            id
            library {
                id
                label(lang: $lang)
            }
            label
            color
            preview
        }
    }
`;
