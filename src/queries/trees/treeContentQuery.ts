import {Query} from '@apollo/react-components';
import gql from 'graphql-tag';
import {TREE_CONTENT, TREE_CONTENTVariables} from '../../_gqlTypes/TREE_CONTENT';
import {recordIdentityFragment} from '../libraries/recordIdentityFragment';

/* tslint:disable-next-line:variable-name */
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
