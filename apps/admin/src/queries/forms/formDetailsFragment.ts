// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
