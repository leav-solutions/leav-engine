// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import recordIdentityFragment from 'graphQL/queries/records/recordIdentityFragment';

export const getRecordUpdates = gql`
    ${recordIdentityFragment}
    subscription SUB_RECORD_UPDATE($filters: RecordUpdateFilterInput) {
        recordUpdate(filters: $filters) {
            ...RecordIdentity
        }
    }
`;
