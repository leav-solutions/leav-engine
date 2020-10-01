import {Query} from '@apollo/react-components';
import gql from 'graphql-tag';
import {TREE_CONTENT, TREE_CONTENTVariables} from '../../_gqlTypes/TREE_CONTENT';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const TreeContentQuery = p => Query<TREE_CONTENT, TREE_CONTENTVariables>(p);

export const getTreeContentQuery = gql`
    ${recordIdentityFragment}
    query TREE_CONTENT($treeId: ID!, $startAt: TreeElementInput, $lang: [AvailableLanguage!]) {
        treeContent(treeId: $treeId, startAt: $startAt) {
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
                record {
                    ...RecordIdentity
                }
            }
            children {
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
