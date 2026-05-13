import {gql} from '@apollo/client';

export const saveVersionProfileMutation = gql`
    mutation SAVE_VERSION_PROFILE($versionProfile: VersionProfileInput!) {
        saveVersionProfile(versionProfile: $versionProfile) {
            id
            label
            description
            trees {
                id
                label
            }
        }
    }
`;
