import gql from 'graphql-tag';

export const getRecordsFromLibraryQuery = (libraryName: string, pagination: number, offset = 0) => {
    const libQueryName = libraryName.toUpperCase();

    return gql`
        query GET_RECORDS_FROM_${libQueryName}($filters: [FileFilter]) {
            ${libraryName} (
                pagination: {limit: ${pagination}, offset: ${offset}}
                filters: $filters
            ) {
                totalCount
                list {
                    id
                    whoAmI {
                        id
                        label
                        preview {
                            small
                            medium
                            big
                        }
                        library {
                            id
                            label
                        }
                    }
                }
            }
        }
    `;
};
