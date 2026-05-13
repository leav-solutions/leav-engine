import {gql} from '@apollo/client';
import viewDetailsFragment from './viewDetailsFragment';

const saveViewMutation = gql`
    ${viewDetailsFragment}
    mutation SAVE_VIEW($view: ViewInput!) {
        saveView(view: $view) {
            ...ViewDetails
        }
    }
`;

export default saveViewMutation;
