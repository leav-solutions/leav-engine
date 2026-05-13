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
