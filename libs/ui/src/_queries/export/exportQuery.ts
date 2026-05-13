import {gql} from '@apollo/client';

export const exportQuery = gql`
    query EXPORT($library: ID!, $filters: [RecordFilterInput!], $profile: String) {
        export(library: $library, filters: $filters, profile: $profile)
    }
`;
