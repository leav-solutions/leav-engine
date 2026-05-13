import {gql} from '@apollo/client';
import {attributeDetailsFragment} from './attributeFragments';

export const getAttributeByIdQuery = gql`
    ${attributeDetailsFragment}
    query GET_ATTRIBUTE_BY_ID($id: ID) {
        attributes(filters: {id: $id}) {
            totalCount
            list {
                ...AttributeDetails
            }
        }
    }
`;
