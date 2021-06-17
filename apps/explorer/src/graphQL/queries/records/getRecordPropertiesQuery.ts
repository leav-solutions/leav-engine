// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from 'utils';
import {GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linked_library} from '_gqlTypes/GET_FORM';
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {ConditionFilter, ILabel, IRecordIdentityWhoAmI} from '_types/types';

export interface IRecordPropertyAttribute {
    id: string;
    label: ILabel;
    system: boolean;
    type: AttributeType;
    format?: AttributeFormat;
}

export interface ILinkValue {
    id: string;
    whoAmI: IRecordIdentityWhoAmI;
}

interface IRecordPropertyBase {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
}

export interface IRecordPropertyStandard extends IRecordPropertyBase {
    value: string | null;
    raw_value?: string | null;
}

export interface IRecordPropertyLink extends IRecordPropertyBase {
    linkValue: ILinkValue | null;
}

export type RecordProperty = IRecordPropertyStandard | IRecordPropertyLink;

export interface IGetRecordProperties {
    [libName: string]: {
        list: {
            [attributeName: string]: RecordProperty[];
        };
    };
}

export interface IGetRecordPropertiesVariables {
    recordId: string;
}

export interface IRecordPropertiesField {
    attributeId: string;
    linkedAttributes?: string[];
    linkedLibrary?: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linked_library;
}

const _getFieldLinkedLibraryPart = (field: IRecordPropertiesField): string =>
    field.linkedLibrary
        ? `... on ${field.linkedLibrary.gqlNames.type} {
            ${field.linkedAttributes.length ? field.linkedAttributes.join(' ') : 'id'}
        }`
        : '';

const _getFieldQueryPart = (field: IRecordPropertiesField): string => `
    ${field.attributeId}: property(attribute: "${field.attributeId}") {
        id_value
        created_at
        modified_at

        ...on Value {
            value
            raw_value
        }

        ...on LinkValue {
            linkValue: value {
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


                ${_getFieldLinkedLibraryPart(field)}

            }
        }
    }
`;

export const getRecordPropertiesQuery = (libraryGqlType: string, fields: IRecordPropertiesField[]) => {
    return gqlUnchecked`
        query RECORD_PROPERTIES_${libraryGqlType}($recordId: String) {
            ${libraryGqlType}(filters: [{field: "id", condition: ${ConditionFilter.EQUAL}, value: $recordId}]) {
                list {
                    id
                    ${fields.length ? fields.map(field => _getFieldQueryPart(field)).join('\n') : 'id'}
                }
            }
        }
    `;
};
