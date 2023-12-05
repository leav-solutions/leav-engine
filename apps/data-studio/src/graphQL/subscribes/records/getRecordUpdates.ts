// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {valueDetailsFragment} from 'graphQL/mutations/values/valueDetailsFragment';
import recordIdentityFragment from 'graphQL/queries/records/recordIdentityFragment';

export const getRecordUpdates = gql`
    ${recordIdentityFragment}
    ${valueDetailsFragment}
    subscription SUB_RECORD_UPDATE($filters: RecordUpdateFilterInput) {
        recordUpdate(filters: $filters) {
            record {
                ...RecordIdentity
                modified_by: property(attribute: "modified_by") {
                    ... on LinkValue {
                        value {
                            ...RecordIdentity
                        }
                    }
                }
            }
            updatedValues {
                attribute
                value {
                    ...ValueDetails
                }
            }
        }
    }
`;
