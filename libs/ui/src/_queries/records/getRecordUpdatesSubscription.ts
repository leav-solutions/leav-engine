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
