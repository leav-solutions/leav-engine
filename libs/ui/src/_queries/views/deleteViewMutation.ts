import {gql} from '@apollo/client';

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
            library
        }
    }
`;

export default deleteViewMutation;
