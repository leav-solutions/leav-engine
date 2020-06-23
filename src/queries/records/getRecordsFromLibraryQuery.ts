import gql from 'graphql-tag';

export const getRecordsFromLibraryQuery = (libraryName: string, filterName: string, searchableFields?: string) => {
    const libQueryName = libraryName.toUpperCase();

    return gql`
        query ${'GET_RECORDS_FROM_' + libQueryName} (
            $limit: Int!
            $offset: Int
            $filters: [${filterName}]
            $sortField: ${searchableFields}!
            $sortOrder: SortOrder!
        ) {
            ${libraryName} (
                pagination: {limit: $limit, offset: $offset}
                filters: $filters
                sort: {field: $sortField, order: $sortOrder}
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
