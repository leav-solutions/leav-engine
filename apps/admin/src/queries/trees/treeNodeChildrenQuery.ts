import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const getTreeNodeChildrenQuery = gql`
    ${recordIdentityFragment}
    query TREE_NODE_CHILDREN($treeId: ID!, $node: ID, $pagination: Pagination) {
        treeNodeChildren(treeId: $treeId, node: $node, pagination: $pagination) {
            list {
                id
                order
                childrenCount
                record {
                    ...RecordIdentity
                }
                ancestors {
                    id
                    record {
                        id
                        library {
                            id
                            label
                        }
                        ...RecordIdentity
                    }
                }
            }
        }
    }
`;
