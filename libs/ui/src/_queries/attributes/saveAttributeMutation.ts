import {gql} from '@apollo/client';
import {attributeDetailsFragment} from './attributeDetailsFragment';

export const saveAttributeMutation = gql`
    ${attributeDetailsFragment}
    mutation SAVE_ATTRIBUTE($attribute: AttributeInput!) {
        saveAttribute(attribute: $attribute) {
            ...AttributeDetails
        }
    }
`;
