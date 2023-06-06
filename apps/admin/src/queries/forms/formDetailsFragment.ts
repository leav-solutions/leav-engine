// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
    }
`;
