// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Mutation} from '@apollo/react-components';
import gql from 'graphql-tag';
import {SAVE_LIBRARY, SAVE_LIBRARYVariables} from '../../_gqlTypes/SAVE_LIBRARY';
import {attributeDetailsFragment} from '../attributes/attributeFragments';

export const SaveLibMutation = p => Mutation<SAVE_LIBRARY, SAVE_LIBRARYVariables>(p);

export const saveLibQuery = gql`
    ${attributeDetailsFragment}
    mutation SAVE_LIBRARY($libData: LibraryInput!, $lang: [AvailableLanguage!]) {
        saveLibrary(library: $libData) {
            id
            system
            label
            behavior
            attributes {
                ...AttributeDetails
            }
            fullTextAttributes {
                id
                label
            }
            permissions_conf {
                permissionTreeAttributes {
                    id
                    ... on TreeAttribute {
                        linked_tree
                    }
                    label(lang: $lang)
                }
                relation
            }
            recordIdentityConf {
                label
                color
                preview
            }
            defaultView {
                id
            }
            gqlNames {
                query
                type
                list
                filter
                searchableFields
            }
        }
    }
`;
