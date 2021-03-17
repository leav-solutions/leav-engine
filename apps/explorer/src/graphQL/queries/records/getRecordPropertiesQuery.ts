// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from 'utils';
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {ILabel} from '_types/types';

export interface IRecordPropertyAttribute {
    id: string;
    label: ILabel;
    system: boolean;
    type: AttributeType;
    format?: AttributeFormat;
}

export interface IRecordProperty {
    id_value: string | null;
    value: string | null;
    raw_value: string | null;
    created_at: number | null;
    modified_at: number | null;
}

export interface IGetRecordProperties {
    [libName: string]: {
        list: {
            [attributeName: string]: IRecordProperty[];
        };
    };
}

export interface IGetRecordPropertiesVariables {
    recordId: string;
}

export const getRecordPropertiesQuery = (libraryGqlType: string, attributes: string[]) => {
    const uniqueAttributes = [...new Set(attributes)];
    return gqlUnchecked`
        query RECORD_PROPERTIES_${libraryGqlType}($recordId: String) {
            ${libraryGqlType}(filters: [{field: "id", value: $recordId}]) {
                list {
                    ${
                        uniqueAttributes.length
                            ? uniqueAttributes.map(
                                  attribute => `
                        ${attribute}: property(attribute: "${attribute}") {
                            id_value
                            created_at
                            modified_at

                            ...on Value {
                                value
                                raw_value
                            }
                        }
                    `
                              )
                            : 'id'
                    }
                }
            }
        }
    `;
};
