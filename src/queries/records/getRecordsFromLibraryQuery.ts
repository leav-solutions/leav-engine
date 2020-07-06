import gql from 'graphql-tag';
import {IItemsColumn} from '../../_types/types';

export const getRecordsFromLibraryQuery = (libraryName: string, filterName: string, columns: IItemsColumn[]) => {
    const libQueryName = libraryName.toUpperCase();

    const fields = columns.map(col => {
        if (col.isLink) {
            return `${col.id} {
                id
                whoAmI {
                    id
                    label
                    color
                    library {
                        id
                        label
                    }
                    preview {
                        small
                        medium
                        big 
                        pages
                    }
                }
            }`;
        } else {
            return col.id;
        }
    });

    return gql`
        query ${'GET_RECORDS_FROM_' + libQueryName} (
            $limit: Int!
            $offset: Int
            $filters: [${filterName}]
            $sortField: String
            $sortOrder: SortOrder!
        ) {
            ${libraryName} (
                pagination: {limit: $limit, offset: $offset}
                filters: $filters
                sort: {field: $sortField, order: $sortOrder}
            ) {
                totalCount
                list {
                    ${fields}
                    whoAmI {
                        id
                        label
                        color
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
