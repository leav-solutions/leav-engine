import {gql} from '@apollo/client';

export const getAttributesQuery = gql`
    query GET_ATTRIBUTES($pagination: Pagination, $sort: SortAttributes, $filters: AttributesFiltersInput) {
        attributes(pagination: $pagination, sort: $sort, filters: $filters) {
            totalCount
            list {
                id
                label
                type
                format
                system
            }
        }
    }
`;
