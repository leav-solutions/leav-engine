import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../../gqlFragments';

export const applicationDetailsFragment = gql`
    ${recordIdentityFragment}
    fragment DetailsApplication on Application {
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
