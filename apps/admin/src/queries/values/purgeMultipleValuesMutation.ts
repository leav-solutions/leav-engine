import {gql} from '@apollo/client';

export const purgeMultipleValuesMutation = gql`
    mutation PURGE_MULTIPLE_VALUES($attributeId: ID!) {
        purgeMultipleValues(attributeId: $attributeId)
    }
`;
