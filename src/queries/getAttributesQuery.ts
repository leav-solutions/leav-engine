import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables} from '../_gqlTypes/GET_ATTRIBUTES';

export const getAttributesQuery = gql`
    query GET_ATTRIBUTES($id: ID) {
        attributes(id: $id) {
            id
            type
            format
            system
            label {
                fr
                en
            }
        }
    }
`;

export class AttributesQuery extends Query<GET_ATTRIBUTES, GET_ATTRIBUTESVariables> {}
