import {gql} from '@apollo/client';
import {treeDetailsFragment} from './treeDetailsFragment';

export const getTreeByIdQuery = gql`
    ${treeDetailsFragment}
    query GET_TREE_BY_ID($id: [ID!]) {
        trees(filters: {id: $id}) {
            list {
                ...TreeDetails
            }
        }
    }
`;
