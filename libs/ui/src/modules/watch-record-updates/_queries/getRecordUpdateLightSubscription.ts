import {gql} from '@apollo/client';

// Deliberately minimal payload: the record id and the touched attribute ids, nothing else.
// The `recordUpdate` resolver applies NO record-permission check (see
// docs/record-update-subscriptions.md), so a library-wide subscriber would receive labels
// and values of records outside its permission scope if they were requested. By carrying
// no business data, this subscription reduces the leak to existence metadata ("record X
// changed attribute Y"); actual data is then fetched through queries, which do enforce
// permissions server-side.
export const getRecordUpdateLightSubscription = gql`
    subscription RECORD_UPDATE_LIGHT($filters: RecordUpdateFilterInput) {
        recordUpdate(filters: $filters) {
            record {
                id
            }
            updatedValues {
                attribute
            }
        }
    }
`;
