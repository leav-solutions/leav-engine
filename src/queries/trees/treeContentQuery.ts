import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {TREE_CONTENT, TREE_CONTENTVariables} from 'src/_gqlTypes/TREE_CONTENT';

export class TreeContentQuery extends Query<TREE_CONTENT, TREE_CONTENTVariables> {}

export const getTreeContentQuery = gql`
    query TREE_CONTENT($treeId: ID!, $startAt: TreeElementInput, $lang: [AvailableLanguage!]) {
        treeContent(treeId: $treeId, startAt: $startAt) {
            record {
                id
                library {
                    id
                    label(lang: $lang)
                }
            }
            children {
                record {
                    id
                    library {
                        id
                        label(lang: $lang)
                    }
                }
            }
        }
    }
`;
