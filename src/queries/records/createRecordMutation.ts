import gql from 'graphql-tag';

export const createRecordQuery = gql`
    mutation CREATE_RECORD($library: ID!) {
        createRecord(library: $library) {
            id
        }
    }
`;
