// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getGraphqlTypeFromLibraryName} from '@leav/utils';
import {
    AttributeFormat,
    AttributeType,
    RecordFilterCondition,
    RecordFormAttributeLinkAttributeFragment,
    ValueVersionInput
} from '_ui/_gqlTypes';
import {gqlUnchecked} from '_ui/_utils';
import {recordIdentityFragment} from '../../gqlFragments';
import {IRecordIdentityWhoAmI} from '../../types/records';
import {SystemTranslation} from '../../types/scalars';
import {IValueVersion} from '../../types/values';
import {valuesVersionDetailsFragment} from '../values/valuesVersionFragment';

export interface IRecordPropertyAttribute {
    id: string;
    label?: SystemTranslation;
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
    id: string;
    record?: ITreeValueRecord;
    ancestors?: TreePath;
}

export type TreePath = Array<{record?: ITreeValueRecord}>;

export interface IRecordPropertyModifier {
    id: string;
    whoAmI: IRecordIdentityWhoAmI;
}

interface IRecordPropertyBase {
    id_value?: string | null;
    created_at?: number | null;
    created_by?: IRecordPropertyModifier | null;
    modified_at?: number | null;
    modified_by?: IRecordPropertyModifier | null;
    metadata?: Array<{name: string; value: IRecordPropertyStandard}>;
    version?: IValueVersion;
}

export interface IRecordPropertyStandard extends IRecordPropertyBase {
    value?: string | null;
    raw_value?: string | null;
}

export interface IRecordPropertyLink extends IRecordPropertyBase {
    linkValue?: ILinkValue | null;
}

export interface IRecordPropertyTree extends IRecordPropertyBase {
    treeValue?: ITreeValue | null;
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
    library: string;
    recordId: string;
    version?: ValueVersionInput[];
}

export interface IRecordPropertiesField {
    attributeId: string;
    linkedAttributes?: string[];
    linkedLibrary?: RecordFormAttributeLinkAttributeFragment['linked_library'];
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
        version {
            ...ValuesVersionDetails
        }
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

export const getRecordPropertiesQuery = (fields: IRecordPropertiesField[]) => gqlUnchecked`
        ${recordIdentityFragment}
        ${valuesVersionDetailsFragment}

        query RECORD_PROPERTIES($library: ID!, $recordId: String, $version: [ValueVersionInput!]) {
            records (
                library: $library,
                filters: [{field: "id", condition: ${RecordFilterCondition.EQUAL}, value: $recordId}],
                version: $version
            ) {
                list {
                    _id: id
                    ${fields.length ? fields.map(field => _getFieldQueryPart(field)).join('\n') : ''}
                }
            }
        }
    `;
