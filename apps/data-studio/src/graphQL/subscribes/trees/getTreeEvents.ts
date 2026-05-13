import {gql} from '@apollo/client';
import recordIdentityFragment from '../../queries/records/recordIdentityFragment';

export const getTreeEvents = gql`
    ${recordIdentityFragment}
    subscription TREE_EVENTS($filters: TreeEventFiltersInput) {
        treeEvent(filters: $filters) {
            type
            treeId
            element {
                id
                childrenCount
                record {
                    ...RecordIdentity
                }
                permissions {
                    access_tree
                    detach
                    edit_children
                }
            }
            parentNode {
                id
            }
            parentNodeBefore {
                id
            }
        }
    }
`;
