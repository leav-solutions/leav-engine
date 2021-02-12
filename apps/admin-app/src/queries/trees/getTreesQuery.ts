// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Query} from '@apollo/react-components';
import gql from 'graphql-tag';
import {GET_TREES, GET_TREESVariables} from '../../_gqlTypes/GET_TREES';

export const getTreesQueryName = 'GET_TREES';

export const getTreesQuery = gql`
    query GET_TREES($id: ID, $label: String, $system: Boolean, $lang: [AvailableLanguage!]) {
        trees(filters: {id: $id, label: $label, system: $system}) {
            totalCount
            list {
                id
                label(lang: $lang)
                system
                behavior
                libraries {
                    library {
                        id
                        label
                    }
                    settings {
                        allowMultiplePositions
                    }
                }
            }
        }
    }
`;

export const TreesQuery = p => Query<GET_TREES, GET_TREESVariables>(p);
