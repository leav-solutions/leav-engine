// Copyright LEAV Solutions 2017
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
    value: string | null;
}

export interface IRecordColumnValueLink {
    linkValue: IRecordColumnLinkValue | null;
}

export interface IRecordColumnValueTree {
    treeValue: IRecordColumnTreeValue | null;
}

export type RecordColumnValue = IRecordColumnValueStandard | IRecordColumnValueLink | IRecordColumnValueTree;

export type GetRecordColumnsValuesRecord = {
    [attributeName: string]: RecordColumnValue[];
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
            value
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
