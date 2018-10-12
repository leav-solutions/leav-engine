import gql from 'graphql-tag';
import {Mutation} from 'react-apollo';
import {SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables} from '../_gqlTypes/SAVE_ATTRIBUTE';

export const saveAttributeQuery = gql`
    mutation SAVE_ATTRIBUTE($attrData: AttributeInput!) {
        saveAttribute(attribute: $attrData) {
            id
            label {
                fr
                en
            }
            format
            type
            system
        }
    }
`;

export class SaveAttributeMutation extends Mutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables> {}
