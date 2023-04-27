// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {treeDetailsFragment} from './treeDetailsFragment';

export const getTreeByIdQuery = gql`
    ${treeDetailsFragment}
    query GET_TREE_BY_ID($id: ID) {
        trees(filters: {id: $id}) {
            list {
                ...TreeDetails
            }
        }
    }
`;
