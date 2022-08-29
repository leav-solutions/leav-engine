// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {recordIdentityFragment} from './recordIdentityFragment';

export const createRecordQuery = gql`
    ${recordIdentityFragment}
    mutation CREATE_RECORD($library: ID!) {
        createRecord(library: $library) {
            id
            ...RecordIdentity
        }
    }
`;
