import gql from 'graphql-tag';
import {AttributeType, IItemsColumn} from '../../_types/types';
import {infosCol} from './../../constants/constants';

export const getRecordsFields = (columns: IItemsColumn[]) => {
    const fields = columns.map(col => {
        if (col.id === infosCol) {
            return null;
        }

        if (col.originAttributeData?.id) {
            // is attribute from a linked library or tree

            if (col.id === col.originAttributeData?.id) {
                // case when the attribute linked is checked, return WhoAmI
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
            if (col.treeData) {
                return `
                    ${col.originAttributeData?.id} {
                        record {
                           ... on ${col.treeData?.libraryTypeName} {
                                ${handleType(col)}
                           }
                        }
                    }
                `;
            } else if (col.type) {
                return `
                    ${col.originAttributeData?.id} {
                        ${handleType(col)}
                    }
                `;
            }
            return `
                ${col.originAttributeData?.id} {
                    ${col.id}
                }
            `;
        }
        return handleType(col);
    });

    return fields;
};

export const getRecordsFromLibraryQuery = (libraryName: string, filterName: string, columns: IItemsColumn[]) => {
    const libQueryName = libraryName.toUpperCase();

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
                    ${getRecordsFields(columns)}
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
