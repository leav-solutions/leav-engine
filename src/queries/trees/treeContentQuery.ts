import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {TREE_CONTENT, TREE_CONTENTVariables} from '../../_gqlTypes/TREE_CONTENT';
import {recordIdentityFragment} from '../libraries/recordIdentityFragment';

export class TreeContentQuery extends Query<TREE_CONTENT, TREE_CONTENTVariables> {}

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
