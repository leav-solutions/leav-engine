import {gql} from '@apollo/client';

export const treeDetailsFragment = gql`
    fragment TreeDetails on Tree {
        id
        label
        behavior
        system
        libraries {
            library {
                id
                label
            }
            settings {
                allowMultiplePositions
                allowedAtRoot
                allowedChildren
            }
        }
    }
`;
