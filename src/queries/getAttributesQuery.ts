import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables} from '../_gqlTypes/GET_ATTRIBUTES';
import {attributeDetailsFragment} from './attributeFragments';

export const getAttributesQuery = gql`
    ${attributeDetailsFragment}
    query GET_ATTRIBUTES($id: ID) {
        attributes(id: $id) {
            ...AttributeDetails
        }
    }
`;

export class AttributesQuery extends Query<GET_ATTRIBUTES, GET_ATTRIBUTESVariables> {}
