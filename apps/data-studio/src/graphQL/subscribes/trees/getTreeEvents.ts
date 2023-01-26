// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import recordIdentityFragment from 'graphQL/queries/records/recordIdentityFragment';

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
