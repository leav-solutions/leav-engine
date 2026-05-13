import {gql} from '@apollo/client';

export const getViewsQuery = gql`
    query GET_VIEWS($library: String!) {
        views(library: $library) {
            list {
                id
                label
            }
        }
    }
`;
