// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../../gqlFragments/recordIdentityFragment';
import {valueDetailsFragment} from '../values/valueDetailsFragment';

export const getRecordUpdatesSubscription = gql`
    ${recordIdentityFragment}
    ${valueDetailsFragment}
    subscription RECORD_UPDATE($filters: RecordUpdateFilterInput) {
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
