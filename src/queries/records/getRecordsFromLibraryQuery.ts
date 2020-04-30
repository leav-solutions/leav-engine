import gql from 'graphql-tag';

export const getQueryFromLibraryQuery = (libraryName: string) => gql`
    query GET_RECORDS_FROM_${libraryName.toUpperCase()} {
        ${libraryName} {
            list {
                id
            }
        }
    }
`;
