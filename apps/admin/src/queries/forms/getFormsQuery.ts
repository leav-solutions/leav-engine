// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getFormsQuery = gql`
    query GET_FORMS_LIST($library: ID!, $id: ID, $label: String, $system: Boolean) {
        forms(filters: {library: $library, id: $id, label: $label, system: $system}) {
            totalCount
            list {
                id
                label
                system
            }
        }
    }
`;
