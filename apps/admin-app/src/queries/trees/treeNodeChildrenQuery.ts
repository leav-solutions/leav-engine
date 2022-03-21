// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

export const getTreeNodeChildrenQuery = gql`
    ${recordIdentityFragment}
    query TREE_NODE_CHILDREN($treeId: ID!, $node: ID, $pagination: Pagination, $lang: [AvailableLanguage!]) {
        treeNodeChildren(treeId: $treeId, node: $node, pagination: $pagination) {
            list {
                id
                order
                childrenCount
                record {
                    ...RecordIdentity
                }
            }
        }
    }
`;
