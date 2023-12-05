// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

export const getMe = gql`
    ${recordIdentityFragment}

    query ME {
        me {
            ...RecordIdentity
        }
    }
`;
