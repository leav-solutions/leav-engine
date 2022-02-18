// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Query} from '@apollo/react-components';
import gql from 'graphql-tag';
import {TREE_CONTENT, TREE_CONTENTVariables} from '../../_gqlTypes/TREE_CONTENT';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const TreeContentQuery = p => Query<TREE_CONTENT, TREE_CONTENTVariables>(p);

export const getTreeContentQuery = gql`
    ${recordIdentityFragment}
    query TREE_CONTENT($treeId: ID!, $startAt: ID, $lang: [AvailableLanguage!]) {
        treeContent(treeId: $treeId, startAt: $startAt) {
            id
            order
            record {
                id
                library {
                    id
                    label(lang: $lang)
                }
                ...RecordIdentity
            }
            ancestors {
                id
                record {
                    id
                    library {
                        id
                        label(lang: $lang)
                    }
                    ...RecordIdentity
                }
            }
            children {
                id
                order
                record {
                    id
                    library {
                        id
                        label(lang: $lang)
                    }
                    ...RecordIdentity
                }
            }
        }
    }
`;
