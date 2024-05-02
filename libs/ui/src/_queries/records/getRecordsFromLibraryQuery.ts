// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {recordIdentityFragment} from '_ui/gqlFragments/recordIdentityFragment';
import {IField, IQueryFilter} from '_ui/types/search';
import {AttributeType, RecordIdentityFragment, RecordSortInput, ValueVersionInput} from '_ui/_gqlTypes';
import {gqlUnchecked} from '_ui/_utils';

export interface IGetRecordsFromLibraryQueryElement extends RecordIdentityFragment {
    [x: string]: any;
}

export interface IGetRecordsFromLibraryQuery {
    records: {
        list: IGetRecordsFromLibraryQueryElement[];
        totalCount: number;
    };
}

export interface IGetRecordsFromLibraryQueryVariables {
    library: string;
    limit?: number;
    offset?: number;
    filters?: IQueryFilter[];
    sort?: RecordSortInput;
    fullText?: string;
    version?: ValueVersionInput[];
}

const _handleType = (field: IField): string => {
    let typePart: string;
    switch (field.type) {
        case AttributeType.simple:
        case AttributeType.advanced:
            typePart = `
                ...on Value {
                    value
                }
            `;
            break;
        case AttributeType.simple_link:
        case AttributeType.advanced_link:
            typePart = `
                ...on LinkValue {
                    linkValue: value {
                        ...RecordIdentity
                    }
                }
            `;
            break;
        case AttributeType.tree:
            typePart = `
                ...on TreeValue {
                    treeValue: value {
                        record {
                            ...RecordIdentity
                        }
                    }
                }
            `;
            break;
    }

    return `
        ${field.id}: property(attribute: "${field.id}") {
            ${typePart.trim()}
        }
    `;
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
                    return _handleType(field);
                case AttributeType.simple_link:
                case AttributeType.advanced_link:
                    return `${parentAttributeId}: property(attribute: "${parentAttributeId}")) {
                        ${_handleType(field)}
                    }`;
                case AttributeType.tree:
                    return `${parentAttributeId}: property(attribute: "${parentAttributeId}")) {
                        record {
                            ${_handleType(field)}
                        }
                    }`;
            }
        } else if (field.embeddedData) {
            const path = [...field.embeddedData.path.split('.')].shift();
            return path;
        }

        return _handleType(field);
    });

    return queryField;
};

export const getRecordsFromLibraryQuery = (fields?: IField[], withTotalCount?: boolean) => gqlUnchecked`
        ${recordIdentityFragment}
        query GET_RECORDS (
            $library: ID!
            $limit: Int!
            $offset: Int
            $filters: [RecordFilterInput]
            $sort: RecordSortInput
            $fullText: String
            $version: [ValueVersionInput]
        ) {
            records (
                library: $library
                pagination: {limit: $limit, offset: $offset}
                filters: $filters
                sort: $sort
                searchQuery: $fullText,
                version: $version
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
