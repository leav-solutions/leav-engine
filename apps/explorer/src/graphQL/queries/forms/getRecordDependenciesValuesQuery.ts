// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from 'utils';
import {AttributeConditionFilter} from '_types/types';

export interface IGetRecordDependenciesValue {
    ancestors: Array<{
        record: ITreeValueRecord;
    }>;
}

export interface ITreeValueRecord {
    id: string;
    library: {
        id: string;
    };
}

type AttributeId = string;
export interface IGetRecordDependenciesValues {
    record: {
        totalCount: number;
        list: RecordDependenciesValuesByAttribute[];
    };
}

export type RecordDependenciesValuesByAttribute = Record<
    AttributeId,
    IGetRecordDependenciesValue | IGetRecordDependenciesValue[]
>;

export interface IGetRecordDependenciesValuesVariables {
    id: string;
}

export function getRecordDependenciesValuesQuery(libraryGqlName: string, attributes: string[]) {
    return gqlUnchecked`
        query ${`RECORD_DEPS_VALUES_${libraryGqlName}`}($id: String!) {
            record: ${libraryGqlName}(filters: {field: "id", condition: ${
        AttributeConditionFilter.EQUAL
    }, value: $id}) {
                totalCount
                ${
                    attributes.length
                        ? `list {
                            ${attributes.map(
                                attr => `${attr} {
                                    ancestors {record {id library {id}}}
                                }`
                            )}
                        }`
                        : ''
                }
            }
        }
    `;
}
