// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../../gqlFragments';

const createRecordMutation = gql`
    ${recordIdentityFragment}
    mutation CREATE_RECORD($library: ID!, $data: CreateRecordDataInput) {
        createRecord(library: $library, data: $data) {
            record {
                ...RecordIdentity
            }
            valuesErrors {
                type
                attribute
                input
                message
            }
        }
    }
`;

export default createRecordMutation;
