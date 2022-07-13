// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getGraphqlTypeFromLibraryName} from '@leav/utils';
import {gqlUnchecked} from 'utils';
import {AttributeType} from '_gqlTypes/globalTypes';
import {IField, IFieldTypeTree} from '../../../_types/types';
import recordIdentityFragment from './recordIdentityFragment';

const handleType = (field: IField): string => {
    switch (field.type) {
        case AttributeType.simple:
        case AttributeType.advanced:
            return field.id;
        case AttributeType.simple_link:
        case AttributeType.advanced_link:
            return `${field.id} {
                ...RecordIdentity
            }`;
        case AttributeType.tree:
            return `${field.id} {
                record {
                    ...RecordIdentity
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
                    const libTypeName = getGraphqlTypeFromLibraryName((field as IFieldTypeTree).recordLibrary);
                    return libTypeName
                        ? `${parentAttributeId} {
                        record {
                            ...on ${libTypeName} {
                                ${handleType(field)}
                            }
                        }
                    }`
                        : '';
            }
        } else if (field.embeddedData) {
            const path = [...field.embeddedData.path.split('.')].shift();
            return path;
        }

        return handleType(field);
    });

    return queryField;
};

export const getRecordsFromLibraryQuery = (libraryName?: string, fields?: IField[], withTotalCount?: boolean) => {
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
        ${recordIdentityFragment}
        query ${'GET_RECORDS_FROM_' + libQueryName} (
            $limit: Int!
            $offset: Int
            $filters: [RecordFilterInput]
            $sortField: String
            $sortOrder: SortOrder!
            $fullText: String
        ) {
            ${libraryName} (
                pagination: {limit: $limit, offset: $offset}
                filters: $filters
                sort: {field: $sortField, order: $sortOrder}
                searchQuery: $fullText
            ) {
                ${withTotalCount ? 'totalCount' : ''}
                list {
                    _id: id
                    ${getRecordsFields(fields)}
                    ...RecordIdentity
                }
            }
        }
    `;
};
