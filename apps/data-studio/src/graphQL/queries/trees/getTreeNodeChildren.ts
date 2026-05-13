import {gql} from '@apollo/client';
import recordIdentityFragment from '../records/recordIdentityFragment';

export const treeNodeChildrenQuery = gql`
    ${recordIdentityFragment}
    query TREE_NODE_CHILDREN($treeId: ID!, $node: ID, $pagination: Pagination) {
        treeNodeChildren(treeId: $treeId, node: $node, pagination: $pagination) {
            totalCount
            list {
                id
                childrenCount
                record {
                    ...RecordIdentity
                    active: property(attribute: "active") {
                        ... on Value {
                            value
                        }
                    }
                }
                permissions {
                    access_tree
                    detach
                    edit_children
                }
            }
        }
    }
`;
