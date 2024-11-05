// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {recordIdentityFragment} from '@leav/ui';
import gql from 'graphql-tag';

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
