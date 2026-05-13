import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const getGlobalSettingsQuery = gql`
    ${recordIdentityFragment}
    query GET_GLOBAL_SETTINGS {
        globalSettings {
            defaultApp
            name
            icon {
                id
                ...RecordIdentity
            }
            favicon {
                id
                ...RecordIdentity
            }
            settings
        }
    }
`;
