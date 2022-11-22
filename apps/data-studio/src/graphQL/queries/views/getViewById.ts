// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import recordIdentityFragment from 'graphQL/queries/records/recordIdentityFragment';
import viewDetailsFragment from './viewDetailsFragment';

export const getViewByIdQuery = gql`
    ${recordIdentityFragment}
    ${viewDetailsFragment}
    query GET_VIEW($viewId: String!) {
        view(viewId: $viewId) {
            ...ViewDetails
        }
    }
`;
