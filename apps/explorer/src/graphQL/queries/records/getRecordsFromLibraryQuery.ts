// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from 'utils';
import {AttributeType, IField} from '../../../_types/types';

const handleType = (field: IField): string => {
    switch (field.type) {
        case AttributeType.simple:
        case AttributeType.advanced:
            return field.id;
        case AttributeType.simple_link:
        case AttributeType.advanced_link:
            return `${field.id} {
                id
                whoAmI {
                    id
                    label
                    color
                    library {
                        id
                        label
                        gqlNames {
                            query
                            type
                        }
                    }
                    preview {
                        small
                        medium
                        big
                        pages
                    }
                }
            }`;
        case AttributeType.tree:
            return `${field.id} {
                record {
                    whoAmI {
                        id
                        label
                        color
                        library {
                            id
                            label
                            gqlNames {
                                query
                                type
                            }
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
    }
};

// manage linked elements and extended attributes
export const getRecordsFields = (fields: IField[] = []) => {
    if (!fields.length) {
        return 'id';
    }

    const queryField = fields.map(field => {
        if (field.parentAttributeData) {
            const parentAttributeId = field.parentAttributeData.id;

            switch (field.parentAttributeData.type) {
                case AttributeType.simple:
                case AttributeType.advanced:
                    return handleType(field);
                case AttributeType.simple_link:
                case AttributeType.advanced_link:
                    return `${parentAttributeId} {
                        ${handleType(field)}
                    }`;
                case AttributeType.tree:
                    return `${parentAttributeId} {
                        record {
                            ${handleType(field)}
                        }
                    }`;
            }
        } else if (field.embeddedData) {
            const path = [...field.embeddedData.path.split('.')].shift();
            return path;
        }

        return handleType(field);
    });

    return queryField;
};

export const getRecordsFromLibraryQuery = (libraryName?: string, fields?: IField[]) => {
    const libQueryName = libraryName?.toUpperCase();

    if (!libQueryName?.length) {
        return gqlUnchecked`
            query nothing {
                libraries {
                    list {
                        id
                    }
                }
            }
        `;
    }

    return gqlUnchecked`
        query ${'GET_RECORDS_FROM_' + libQueryName} (
            $limit: Int!
            $offset: Int
            $filters: [RecordFilterInput]
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
                    ${getRecordsFields(fields)}
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
                            gqlNames {
                                query
                                type
                            }
                        }
                    }
                }
            }
        }
    `;
};
