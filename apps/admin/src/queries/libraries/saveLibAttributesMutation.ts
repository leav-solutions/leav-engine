// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {attributeDetailsFragment} from '../attributes/attributeFragments';

export const saveLibAttributesMutation = gql`
    ${attributeDetailsFragment}
    mutation SAVE_LIBRARY_ATTRIBUTES($libId: ID!, $attributes: [ID!]!) {
        saveLibrary(library: {id: $libId, attributes: $attributes}) {
            id
            attributes {
                ...AttributeDetails
            }
        }
    }
`;
