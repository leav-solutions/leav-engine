// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const installApplicationMutation = gql`
    mutation INSTALL_APPLICATION($id: ID!) {
        installApplication(id: $id)
    }
`;
