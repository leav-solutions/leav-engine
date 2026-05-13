import {gql} from '@apollo/client';
import {valueDetailsFragment} from './valueDetailsFragment';

export const deleteValueMutation = gql`
    ${valueDetailsFragment}
    mutation DELETE_VALUE($library: ID!, $recordId: ID!, $attribute: ID!, $value: ValueInput) {
        deleteValue(library: $library, recordId: $recordId, attribute: $attribute, value: $value) {
            ...ValueDetails
        }
    }
`;
