import {gql} from '@apollo/client';
import {attributeDetailsFragment} from './attributeDetailsFragment';

export const getAttributeByIdQuery = gql`
    ${attributeDetailsFragment}
    query GET_ATTRIBUTE_BY_ID($id: ID) {
        attributes(filters: {id: $id}) {
            list {
                ...AttributeDetails
            }
        }
    }
`;
