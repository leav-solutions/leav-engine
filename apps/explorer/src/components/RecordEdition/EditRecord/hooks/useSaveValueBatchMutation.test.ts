// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as apolloClient from '@apollo/client';
import {ErrorTypes} from '@leav/utils/src';
import {
    SAVE_VALUE_BATCH,
    SAVE_VALUE_BATCH_saveValueBatch_errors,
    SAVE_VALUE_BATCH_saveValueBatch_values_Value,
    SAVE_VALUE_BATCH_saveValueBatch_values_Value_attribute
} from '_gqlTypes/SAVE_VALUE_BATCH';
import {Mockify} from '_types/Mockify';
import {mockAttribute} from '__mocks__/common/attribute';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import {APICallStatus} from '../_types';
import useSaveValueBatchMutation from './useSaveValueBatchMutation';

describe('useSaveValueBatchMutation', () => {
    const mockApolloCache: Mockify<apolloClient.ApolloCache<any>> = {modify: jest.fn(), identify: jest.fn()};
    const mockApolloClient: Mockify<apolloClient.ApolloClient<any>> = {
        cache: (mockApolloCache as unknown) as apolloClient.ApolloCache<any>
    };

    jest.spyOn(apolloClient, 'useApolloClient').mockImplementation(
        () => (mockApolloClient as unknown) as apolloClient.ApolloClient<any>
    );

    const mockValue: SAVE_VALUE_BATCH_saveValueBatch_values_Value = {
        id_value: '12345',
        modified_at: null,
        modified_by: null,
        created_at: null,
        created_by: null,
        version: null,
        attribute: ({
            ...mockAttribute,
            system: false
        } as unknown) as SAVE_VALUE_BATCH_saveValueBatch_values_Value_attribute,
        value: null,
        raw_value: null
    };

    test('If no errors, return values', async () => {
        jest.spyOn(apolloClient, 'useMutation').mockImplementation(() => [
            (): Promise<apolloClient.FetchResult<SAVE_VALUE_BATCH>> =>
                Promise.resolve({
                    data: {
                        saveValueBatch: {
                            values: [mockValue],
                            errors: []
                        }
                    }
                }),
            {loading: false, called: true, client: null, reset: null}
        ]);

        const {saveValues} = useSaveValueBatchMutation();
        const res = await saveValues(mockRecordWhoAmI, [
            {
                attribute: 'test_attribute',
                idValue: null,
                value: 'foo'
            }
        ]);

        expect(res).toEqual({
            status: APICallStatus.SUCCESS,
            values: [mockValue],
            errors: []
        });
    });

    const mockError: SAVE_VALUE_BATCH_saveValueBatch_errors = {
        type: ErrorTypes.VALIDATION_ERROR,
        attribute: 'test_attribute',
        input: 'foo',
        message: 'error'
    };

    test('If errors and no values, return errors', async () => {
        jest.spyOn(apolloClient, 'useMutation').mockImplementation(() => [
            (): Promise<apolloClient.FetchResult<SAVE_VALUE_BATCH>> =>
                Promise.resolve({
                    data: {
                        saveValueBatch: {
                            values: [],
                            errors: [mockError]
                        }
                    }
                }),
            {loading: false, called: true, client: null, reset: null}
        ]);

        const {saveValues} = useSaveValueBatchMutation();
        const res = await saveValues(mockRecordWhoAmI, [
            {
                attribute: 'test_attribute',
                idValue: null,
                value: 'foo'
            }
        ]);

        expect(res).toEqual({
            status: APICallStatus.ERROR,
            values: [],
            errors: [mockError]
        });
    });

    test('If errors and values, return both', async () => {
        jest.spyOn(apolloClient, 'useMutation').mockImplementation(() => [
            (): Promise<apolloClient.FetchResult<SAVE_VALUE_BATCH>> =>
                Promise.resolve({
                    data: {
                        saveValueBatch: {
                            values: [mockValue],
                            errors: [mockError]
                        }
                    }
                }),
            {loading: false, called: true, client: null, reset: null}
        ]);

        const {saveValues} = useSaveValueBatchMutation();
        const res = await saveValues(mockRecordWhoAmI, [
            {
                attribute: 'test_attribute',
                idValue: null,
                value: 'foo'
            }
        ]);

        expect(res).toEqual({
            status: APICallStatus.PARTIAL,
            values: [mockValue],
            errors: [mockError]
        });
    });
});
