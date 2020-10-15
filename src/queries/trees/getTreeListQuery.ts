import gql from 'graphql-tag';

export const getTreeListQuery = gql`
    query GET_TREE_LIST_QUERY {
        trees {
            list {
                id
                label
                libraries {
                    id
                    label
                }
            }
        }
    }
`;
