import gql from 'graphql-tag';

export const deleteFormQuery = gql`
    mutation DELETE_FORM($library: ID!, $formId: ID!) {
        deleteForm(library: $library, id: $formId) {
            library {
                id
            }
            id
        }
    }
`;
