// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getGraphqlTypeFromLibraryName} from '@leav/utils';
import {gqlUnchecked} from 'utils';
import {GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linked_library} from '_gqlTypes/GET_FORM';
import {AttributeFormat, AttributeType, RecordFilterCondition} from '_gqlTypes/globalTypes';
import {IRecordIdentityWhoAmI, ISystemTranslation} from '_types/types';
import recordIdentityFragment from './recordIdentityFragment';

export interface IRecordPropertyAttribute {
    id: string;
    label: ISystemTranslation;
    system: boolean;
    type: AttributeType;
    format?: AttributeFormat;
}

export interface ILinkValue {
    id: string;
    whoAmI: IRecordIdentityWhoAmI;
}

export interface ITreeValueRecord {
    id: string;
    whoAmI: IRecordIdentityWhoAmI;
}

export interface ITreeValue {
    record: ITreeValueRecord;
    ancestors: TreePath[];
}

export type TreePath = Array<{record: ITreeValueRecord}>;

export interface IRecordPropertyModifier {
    id: string;
    whoAmI: IRecordIdentityWhoAmI;
}

interface IRecordPropertyBase {
    id_value: string | null;
    created_at: number | null;
    created_by: IRecordPropertyModifier | null;
    modified_at: number | null;
    modified_by: IRecordPropertyModifier | null;
}

export interface IRecordPropertyStandard extends IRecordPropertyBase {
    value: string | null;
    raw_value?: string | null;
}

export interface IRecordPropertyLink extends IRecordPropertyBase {
    linkValue: ILinkValue | null;
}

export interface IRecordPropertyTree extends IRecordPropertyBase {
    treeValue: ITreeValue | null;
}

export type RecordProperty = IRecordPropertyStandard | IRecordPropertyLink | IRecordPropertyTree;

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
        ? `... on ${getGraphqlTypeFromLibraryName(field.linkedLibrary.id)} {
            ${field.linkedAttributes.length ? field.linkedAttributes.join(' ') : 'id'}
        }`
        : '';

const _getFieldQueryPart = (field: IRecordPropertiesField): string => `
    ${field.attributeId}: property(attribute: "${field.attributeId}") {
        id_value
        created_at
        modified_at
        created_by {
            ...RecordIdentity
        }
        modified_by {
            ...RecordIdentity
        }

        ...on Value {
            value
            raw_value
        }

        ...on LinkValue {
            linkValue: value {
                ...RecordIdentity

                ${_getFieldLinkedLibraryPart(field)}

            }
        }

        ...on TreeValue {
            treeValue: value {
                record {
                    ...RecordIdentity
                }

                ancestors {
                    record {
                        ...RecordIdentity
                    }
                }
            }
        }
    }
`;

export const getRecordPropertiesQuery = (libraryGqlType: string, fields: IRecordPropertiesField[]) => {
    return gqlUnchecked`
        ${recordIdentityFragment}

        query RECORD_PROPERTIES_${libraryGqlType}($recordId: String) {
            ${libraryGqlType}(filters: [{field: "id", condition: ${RecordFilterCondition.EQUAL}, value: $recordId}]) {
                list {
                    _id: id
                    ${fields.length ? fields.map(field => _getFieldQueryPart(field)).join('\n') : ''}
                }
            }
        }
    `;
};
