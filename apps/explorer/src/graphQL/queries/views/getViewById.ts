// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import recordIdentityFragment from 'graphQL/queries/records/recordIdentityFragment';

export const getViewByIdQuery = gql`
    ${recordIdentityFragment}

    query GET_VIEW($viewId: String!) {
        view(viewId: $viewId) {
            id
            display {
                size
                type
            }
            shared
            created_by {
                ...RecordIdentity
            }
            label
            description
            color
            filters {
                field
                value
                condition
                operator
            }
            sort {
                field
                order
            }
            settings {
                name
                value
            }
        }
    }
`;
