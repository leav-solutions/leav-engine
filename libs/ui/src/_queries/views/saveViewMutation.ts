// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import viewDetailsFragment from './viewDetailsFragment';

const saveViewMutation = gql`
    ${viewDetailsFragment}
    mutation ADD_VIEW($view: ViewInput!) {
        saveView(view: $view) {
            ...ViewDetails
        }
    }
`;

export default saveViewMutation;
