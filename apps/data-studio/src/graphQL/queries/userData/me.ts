import {gql} from '@apollo/client';
import recordIdentityFragment from '../records/recordIdentityFragment';

export const getMe = gql`
    ${recordIdentityFragment}

    query ME {
        me {
            ...RecordIdentity
        }
    }
`;
