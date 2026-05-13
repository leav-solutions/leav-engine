import {gql} from '@apollo/client';
import {recordIdentityFragment} from '_ui/gqlFragments/recordIdentityFragment';
import viewDetailsFragment from './viewDetailsFragment';

export const getViewByIdQuery = gql`
    ${recordIdentityFragment}
    ${viewDetailsFragment}
    query GET_VIEW($viewId: String!) {
        view(viewId: $viewId) {
            ...ViewDetails
        }
    }
`;
