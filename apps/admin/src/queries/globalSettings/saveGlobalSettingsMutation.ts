import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const saveGlobalSettingsQuery = gql`
    ${recordIdentityFragment}
    mutation SAVE_GLOBAL_SETTINGS($settings: GlobalSettingsInput!) {
        saveGlobalSettings(settings: $settings) {
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
