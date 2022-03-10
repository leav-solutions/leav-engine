// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from 'utils';
import {RecordFilterCondition, RecordFilterOperator} from '_gqlTypes/globalTypes';

export enum RecordPermissionsActions {
    access_record = 'access_record',
    create_record = 'create_record',
    edit_record = 'edit_record',
    delete_record = 'delete_record'
}

export interface IGetRecordPermissions {
    [libName: string]: {
        list: Array<{
            permissions: {[key in RecordPermissionsActions]: boolean};
        }>;
    };
}

export interface IGetRecordPermissionsVariables {
    recordId: string;
}

export const getRecordPermissionsQuery = (libraryGqlQueryName: string) => {
    return gqlUnchecked`
        query GET_RECORD_PERMISSIONS_${libraryGqlQueryName}($recordId: String!) {
            ${libraryGqlQueryName}(filters: [
                {field: "id", condition: ${RecordFilterCondition.EQUAL}, value: $recordId}
                {operator: ${RecordFilterOperator.AND}},
                {operator: ${RecordFilterOperator.OPEN_BRACKET}},
                {field: "active", condition: ${RecordFilterCondition.EQUAL}, value: "true"},
                {operator: ${RecordFilterOperator.OR}},
                {field: "active", condition: ${RecordFilterCondition.EQUAL}, value: "false"},
                {operator: ${RecordFilterOperator.CLOSE_BRACKET}},
            ]) {
                list {
                    permissions {
                        ${Object.values(RecordPermissionsActions).join(' ')}
                    }
                }
            }
        }
    `;
};
