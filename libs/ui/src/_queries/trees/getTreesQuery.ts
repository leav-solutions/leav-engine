import {gql} from '@apollo/client';

export const getTreesQuery = gql`
    fragment TreeLight on Tree {
        id
        label
    }
    query GET_TREES {
        trees {
            list {
                ...TreeLight
            }
        }
    }
`;
