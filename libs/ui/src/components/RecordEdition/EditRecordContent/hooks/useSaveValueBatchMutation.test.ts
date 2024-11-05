// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as apolloClient from '@apollo/client';
import {ErrorTypes, Mockify} from '@leav/utils';
import {SaveValueBatchMutation, ValueDetailsValueFragment} from '_ui/_gqlTypes';
import {mockAttributeSimple} from '_ui/__mocks__/common/attribute';
import {mockRecord} from '_ui/__mocks__/common/record';
import {APICallStatus} from '../_types';
import useSaveValueBatchMutation from './useExecuteSaveValueBatchMutation';

describe('useSaveValueBatchMutation', () => {
    const mockApolloCache: Mockify<apolloClient.ApolloCache<any>> = {modify: jest.fn(), identify: jest.fn()};
    const mockApolloClient: Mockify<apolloClient.ApolloClient<any>> = {
        cache: (mockApolloCache as unknown) as apolloClient.ApolloCache<any>
    };

    jest.spyOn(apolloClient, 'useApolloClient').mockImplementation(
        () => (mockApolloClient as unknown) as apolloClient.ApolloClient<any>
    );

    const mockValue: ValueDetailsValueFragment = {
        id_value: '12345',
        modified_at: null,
        modified_by: null,
        created_at: null,
        created_by: null,
        version: null,
        attribute: ({
            ...mockAttributeSimple,
            system: false
        } as unknown) as ValueDetailsValueFragment['attribute'],
        value: null,
        raw_value: null,
        metadata: null
    };

    test('If no errors, return values', async () => {
        jest.spyOn(apolloClient, 'useMutation').mockImplementation(() => [
            (): Promise<apolloClient.FetchResult<SaveValueBatchMutation>> =>
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
        const res = await saveValues(mockRecord, [
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

    const mockError: SaveValueBatchMutation['saveValueBatch']['errors'][number] = {
        type: ErrorTypes.VALIDATION_ERROR,
        attribute: 'test_attribute',
        input: 'foo',
        message: 'error'
    };

    test('If errors and no values, return errors', async () => {
        jest.spyOn(apolloClient, 'useMutation').mockImplementation(() => [
            (): Promise<apolloClient.FetchResult<SaveValueBatchMutation>> =>
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
        const res = await saveValues(mockRecord, [
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
            (): Promise<apolloClient.FetchResult<SaveValueBatchMutation>> =>
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
        const res = await saveValues(mockRecord, [
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
