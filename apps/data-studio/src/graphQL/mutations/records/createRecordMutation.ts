// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import recordIdentityFragment from 'graphQL/queries/records/recordIdentityFragment';

const createRecordMutation = gql`
    ${recordIdentityFragment}
    mutation CREATE_RECORD($library: ID!) {
        createRecord(library: $library) {
            ...RecordIdentity
        }
    }
`;

export default createRecordMutation;
