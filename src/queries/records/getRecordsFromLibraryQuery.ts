import gql from 'graphql-tag';
import {AttributeType, IItemsColumn} from '../../_types/types';

export const getRecordsFromLibraryQuery = (libraryName: string, filterName: string, columns: IItemsColumn[]) => {
    const libQueryName = libraryName.toUpperCase();

    const fields = columns.map(col => {
        if (col.originAttributeId) {
            if (col.id === col.originAttributeId) {
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
            }
            if (col.type) {
                return `
                ${col.originAttributeId} {
                    ${handleType(col)}
                }
            `;
            }
            return `
                ${col.originAttributeId} {
                    ${col.id}
                }
            `;
        }
        return handleType(col);
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

const handleType = (col: IItemsColumn) => {
    switch (col.type) {
        case AttributeType.tree:
            return `${col.id} {
                record {
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
                }
            }`;
        case AttributeType.simple_link:
        case AttributeType.advanced_link:
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
        case AttributeType.simple:
        case AttributeType.advanced:
        default:
            return col.id;
    }
};
