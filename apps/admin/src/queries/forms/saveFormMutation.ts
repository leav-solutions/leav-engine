import {gql} from '@apollo/client';
import {formDetailsFragment} from './formDetailsFragment';

export const saveFormQuery = gql`
    ${formDetailsFragment}
    mutation SAVE_FORM($formData: FormInput!) {
        saveForm(form: $formData) {
            ...FormDetails
        }
    }
`;
