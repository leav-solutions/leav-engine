// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getApplicationModulesQuery = gql`
    query GET_APPLICATION_MODULES {
        applicationsModules {
            id
            description
            version
        }
    }
`;
