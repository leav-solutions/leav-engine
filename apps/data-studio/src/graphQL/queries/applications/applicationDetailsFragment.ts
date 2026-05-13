import {gql} from '@apollo/client';
import recordIdentityFragment from '../records/recordIdentityFragment';

export const applicationDetailsFragment = gql`
    ${recordIdentityFragment}
    fragment ApplicationDetails on Application {
        id
        label
        type
        description
        endpoint
        url
        color
        icon {
            ...RecordIdentity
        }
        module
        permissions {
            access_application
            admin_application
        }
        settings
    }
`;
