import recordIdentityFragment from '../recordIdentityFragment';
import {gql} from '@apollo/client';

export const getGlobalSettingsQuery = gql`
    ${recordIdentityFragment}
    query GET_GLOBAL_SETTINGS {
        globalSettings {
            name
            icon {
                id
                ...RecordIdentity
            }
        }
    }
`;
