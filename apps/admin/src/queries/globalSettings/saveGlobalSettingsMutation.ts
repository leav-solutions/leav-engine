// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

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
