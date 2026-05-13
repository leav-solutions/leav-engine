import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';
import {applicationDetailsFragment} from './applicationDetailsFragment';

export const getApplicationByIdQuery = gql`
    ${recordIdentityFragment}
    ${applicationDetailsFragment}
    query GET_APPLICATION_BY_ID($id: ID!) {
        applications(filters: {id: $id}) {
            list {
                ...ApplicationDetails
            }
        }
    }
`;
