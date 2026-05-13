import {gql} from '@apollo/client';

export const formElementsByDepsFragment = gql`
    fragment FormElementsByDeps on FormElementsByDeps {
        dependencyValue {
            attribute
            value
        }
        elements {
            id
            containerId
            order
            type
            uiElementType
            settings {
                key
                value
            }
        }
    }
`;
