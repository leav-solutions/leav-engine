import {Mutation} from '@apollo/react-components';
import gql from 'graphql-tag';
import {SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables} from '../../_gqlTypes/SAVE_ATTRIBUTE';

export const saveAttributeQuery = gql`
    mutation SAVE_ATTRIBUTE($attrData: AttributeInput!) {
        saveAttribute(attribute: $attrData) {
            id
            label
            format
            type
            system
            multiple_values
        }
    }
`;

/* tslint:disable-next-line:variable-name */
export const SaveAttributeMutation = p => Mutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables>(p);
