import {gql} from '@apollo/client';
import viewDetailsFragment from './viewDetailsFragment';

export const getViewsListQuery = gql`
    ${viewDetailsFragment}
    query GET_VIEWS_LIST($libraryId: String!) {
        views(library: $libraryId) {
            totalCount
            list {
                ...ViewDetails
            }
        }
    }
`;
