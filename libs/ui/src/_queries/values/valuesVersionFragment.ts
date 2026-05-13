import {gql} from '@apollo/client';

export const valuesVersionDetailsFragment = gql`
    fragment ValuesVersionDetails on ValueVersion {
        treeId
        treeNode {
            id
            record {
                id
                whoAmI {
                    id
                    label
                    library {
                        id
                    }
                }
            }
        }
    }
`;
