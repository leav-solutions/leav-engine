// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export interface IDeleteViewMutation {
    id: string;
}

export interface IDeleteViewMutationVariables {
    viewId: string;
}

const deleteViewMutation = gql`
    mutation DELETE_VIEW($viewId: String!) {
        deleteView(viewId: $viewId) {
            id
        }
    }
`;

export default deleteViewMutation;
