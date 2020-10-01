import gql from 'graphql-tag';

export const formElementsByDepsFragment = gql`
    fragment FormElementsByDeps on FormElementsByDeps {
        dependencyValue {
            attribute
            value {
                id
                library
            }
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
