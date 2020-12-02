// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Mutation} from '@apollo/react-components';
import gql from 'graphql-tag';
import {SAVE_LIBRARY_ATTRIBUTES, SAVE_LIBRARY_ATTRIBUTESVariables} from '../../_gqlTypes/SAVE_LIBRARY_ATTRIBUTES';
import {attributeDetailsFragment} from '../attributes/attributeFragments';

export const saveLibAttributesMutation = gql`
    ${attributeDetailsFragment}
    mutation SAVE_LIBRARY_ATTRIBUTES($libId: ID!, $attributes: [ID!]!, $lang: [AvailableLanguage!]) {
        saveLibrary(library: {id: $libId, attributes: $attributes}) {
            id
            attributes {
                ...AttributeDetails
            }
        }
    }
`;

export const SaveLibAttributesMutation = p => Mutation<SAVE_LIBRARY_ATTRIBUTES, SAVE_LIBRARY_ATTRIBUTESVariables>(p);
