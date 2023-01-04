// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

export const saveGlobalSettingsQuery = gql`
    ${recordIdentityFragment}
    mutation SAVE_GLOBAL_SETTINGS($settings: GlobalSettingsInput!) {
        saveGlobalSettings(settings: $settings) {
            name
            icon {
                id
                ...RecordIdentity
            }
        }
    }
`;
