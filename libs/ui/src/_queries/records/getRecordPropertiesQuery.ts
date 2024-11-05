// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getGraphqlTypeFromLibraryName} from '@leav/utils';
import {
    AttributeFormat,
    AttributeType,
    RecordFilterCondition,
    RecordFormAttributeLinkAttributeFragment,
    ValueDetailsFragment,
    ValueVersionInput
} from '_ui/_gqlTypes';
import {gqlUnchecked} from '_ui/_utils';
import {recordIdentityFragment} from '../../gqlFragments';
import {IRecordIdentityWhoAmI} from '../../types/records';
import {SystemTranslation} from '../../types/scalars';
import {valuesVersionDetailsFragment} from '../values/valuesVersionFragment';
import {IValueVersion} from '_ui/types';

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

interface IRecordPropertyBase<T extends RecordPropertyParam> {
    __typename?: string;
    id_value?: string | null;
    created_at?: number | null;
    created_by?: IRecordPropertyModifier | null;
    modified_at?: number | null;
    modified_by?: IRecordPropertyModifier | null;
    metadata?: Array<{name: string; value: IRecordPropertyStandard}>;
    version?: T extends 'clean' ? IValueVersion : ValueDetailsFragment['version'];
}

type RecordPropertyParam = 'clean' | 'raw';
type DefaultRecordPropertyParam = 'clean';

export interface IRecordPropertyStandard<T extends RecordPropertyParam = DefaultRecordPropertyParam>
    extends IRecordPropertyBase<T> {
    payload?: string | null;
    raw_payload?: string | null;
}

export interface IRecordPropertyLink<T extends RecordPropertyParam = DefaultRecordPropertyParam>
    extends IRecordPropertyBase<T> {
    linkValue?: ILinkValue | null;
}

export interface IRecordPropertyTree<T extends RecordPropertyParam = DefaultRecordPropertyParam>
    extends IRecordPropertyBase<T> {
    treeValue?: ITreeValue | null;
}

export type RecordProperty<T extends RecordPropertyParam = DefaultRecordPropertyParam> =
    | IRecordPropertyStandard<T>
    | IRecordPropertyLink<T>
    | IRecordPropertyTree<T>;

export type RecordPropertyWhoAmI = Pick<IRecordIdentityWhoAmI, 'id'> & {
    library: Pick<IRecordIdentityWhoAmI['library'], 'id'>;
};

export type RecordPropertyListItem = {
    _id: string;
    whoAmI: RecordPropertyWhoAmI;
} & {
    [attributeName: string]: Array<RecordProperty<'raw'>>;
};

export interface IGetRecordProperties {
    [libName: string]: {
        list: RecordPropertyListItem[];
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
            payload
            raw_payload
        }

        ...on LinkValue {
            linkValue: payload {
                ...RecordIdentity

                ${_getFieldLinkedLibraryPart(field)}

            }
        }

        ...on TreeValue {
            treeValue: payload {
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
                    whoAmI {
                        id
                        library {
                            id
                        }
                    }
                    ${fields.length ? fields.map(field => _getFieldQueryPart(field)).join('\n') : ''}
                }
            }
        }
    `;
