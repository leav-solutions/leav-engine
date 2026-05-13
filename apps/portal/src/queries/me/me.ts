import {gql} from '@apollo/client';
import recordIdentityFragment from '../recordIdentityFragment';

export const getMe = gql`
    ${recordIdentityFragment}
    query ME {
        me {
            ...RecordIdentity
        }
    }
`;
