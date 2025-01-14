// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {RecordFilterInput} from '_ui/_gqlTypes';
import {gqlUnchecked} from '_ui/_utils';
import {recordIdentityFragment} from '../../gqlFragments';
import {IRecordIdentityWhoAmI} from '../../types/records';

export interface IRecordColumnLinkValue {
    id: string;
    whoAmI: IRecordIdentityWhoAmI;
}

export interface IRecordColumnTreeValueRecord {
    id: string;
    whoAmI: IRecordIdentityWhoAmI;
}

export interface IRecordColumnTreeValue {
    record: IRecordColumnTreeValueRecord;
}

export interface IRecordColumnValueStandard {
    payload: string | null;
    isCalculated: boolean;
    isInherited: boolean;
}

export interface IRecordColumnValueLink {
    linkValue: IRecordColumnLinkValue | null;
}

export interface IRecordColumnValueTree {
    treeValue: IRecordColumnTreeValue | null;
}

export type RecordColumnValue = IRecordColumnValueStandard | IRecordColumnValueLink | IRecordColumnValueTree;

export type GetRecordColumnsValuesRecord<RecordColumnValues = RecordColumnValue> = {
    [attributeName: string]: RecordColumnValues[];
} & {
    _id: string;
};

export interface IGetRecordColumnsValues {
    records: {
        list: GetRecordColumnsValuesRecord[];
    };
}

export interface IGetRecordColumnsValuesVariables {
    library: string;
    filters: RecordFilterInput[];
}

const _getColumnQueryPart = (column: string): string => `
    ${column}: property(attribute: "${column}") {
        ...on Value {
            payload
            raw_payload
            isInherited
            isCalculated
        }

        ...on LinkValue {
            linkValue: value {
                ...RecordIdentity
            }
        }

        ...on TreeValue {
            treeValue: value {
                record {
                    ...RecordIdentity
                }
            }
        }
    }
`;

export const getRecordColumnsValues = (columns: string[]) => gqlUnchecked`
        ${recordIdentityFragment}
        query RECORD_COLUMNS_VALUES($library: ID!, $filters: [RecordFilterInput]) {
            records(library: $library, filters: $filters) {
                list {
                    _id: id
                    ...RecordIdentity
                    ${columns.length ? columns.map(column => _getColumnQueryPart(column)).join('\n') : ''}
                }
            }
        }
    `;
