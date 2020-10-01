import gql from 'graphql-tag';
import {formElementsByDepsFragment} from './formElementsByDepsFragment';

export const saveFormQuery = gql`
    ${formElementsByDepsFragment}
    mutation SAVE_FORM($formData: FormInput!) {
        saveForm(form: $formData) {
            id
            label
            system
            elements {
                ...FormElementsByDeps
            }
            dependencyAttributes {
                id
                label
            }
        }
    }
`;
