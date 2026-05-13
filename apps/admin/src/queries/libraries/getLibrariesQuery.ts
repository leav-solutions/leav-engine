import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const getLibsQuery = gql`
    ${recordIdentityFragment}
    query GET_LIBRARIES($id: [ID!], $label: [String!], $system: Boolean, $behavior: [LibraryBehavior!]) {
        libraries(filters: {id: $id, label: $label, system: $system, behavior: $behavior}) {
            totalCount
            list {
                id
                system
                label
                behavior
                icon {
                    ...RecordIdentity
                }
            }
        }
    }
`;
