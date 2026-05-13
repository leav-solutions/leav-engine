import {gql} from '@apollo/client';
import {formElementsByDepsFragment} from './formElementsByDepsFragment';

export const formDetailsFragment = gql`
    ${formElementsByDepsFragment}
    fragment FormDetails on Form {
        id
        label
        system
        elements {
            ...FormElementsByDeps
        }
        dependencyAttributes {
            id
            label
            ... on TreeAttribute {
                linked_tree {
                    id
                }
            }
        }
        sidePanel {
            enable
            isOpenByDefault
        }
    }
`;
