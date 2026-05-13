import {gql} from '@apollo/client';
import {formDetailsFragment} from './formDetailsFragment';

export const getFormQuery = gql`
    ${formDetailsFragment}
    query GET_FORM($library: ID!, $id: ID!) {
        forms(filters: {library: $library, id: $id}) {
            totalCount
            list {
                ...FormDetails
            }
        }
    }
`;
