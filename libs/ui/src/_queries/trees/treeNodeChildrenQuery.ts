import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../../gqlFragments';

export const getTreeNodeChildrenQuery = gql`
    ${recordIdentityFragment}

    fragment TreeNodeChild on TreeNodeLight {
        id
        order
        childrenCount
        record {
            ...RecordIdentity
            active: property(attribute: "active") {
                ... on Value {
                    value
                }
            }
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
        permissions {
            access_tree
            detach
            edit_children
        }
    }

    query TREE_NODE_CHILDREN(
        $treeId: ID!
        $node: ID
        $pagination: Pagination
        $childrenAsRecordValuePermissionFilter: ChildrenAsRecordValuePermissionFilterInput
        $dependentValuesPermissionFilter: DependentValuesPermissionFilterInput
    ) {
        treeNodeChildren(
            treeId: $treeId
            node: $node
            pagination: $pagination
            childrenAsRecordValuePermissionFilter: $childrenAsRecordValuePermissionFilter
            dependentValuesPermissionFilter: $dependentValuesPermissionFilter
        ) {
            totalCount
            list {
                ...TreeNodeChild
            }
        }
    }
`;
