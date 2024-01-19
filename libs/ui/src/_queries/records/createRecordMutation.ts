// Copyright LEAV Solutions 2017
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
                attributeId
                id_value
                input
                message
                type
            }
        }
    }
`;

export default createRecordMutation;
