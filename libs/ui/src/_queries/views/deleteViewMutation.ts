// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
