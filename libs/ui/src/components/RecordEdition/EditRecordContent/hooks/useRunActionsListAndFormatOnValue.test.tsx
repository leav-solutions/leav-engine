// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as apolloClient from '@apollo/client';
import {Mockify} from '@leav/utils';
import {RunActionsListAndFormatOnValueDocument} from '_ui/_gqlTypes';
import {useRunActionsListAndFormatOnValue} from './useRunActionsListAndFormatOnValue';
import {MockedProvider} from '@apollo/client/testing';
import {act, renderHook} from '_ui/_tests/testUtils';

describe('useRunActionsListAndFormatOnValue', () => {
    const mockApolloCache: Mockify<apolloClient.ApolloCache<any>> = {modify: jest.fn(), identify: jest.fn()};
    const mockApolloClient: Mockify<apolloClient.ApolloClient<any>> = {
        cache: mockApolloCache as unknown as apolloClient.ApolloCache<any>
    };

    jest.spyOn(apolloClient, 'useApolloClient').mockImplementation(
        () => mockApolloClient as unknown as apolloClient.ApolloClient<any>
    );

    const successMock = [
        {
            request: {
                query: RunActionsListAndFormatOnValueDocument,
                variables: {
                    library: 'test_library',
                    value: {
                        attribute: 'test_attribute',
                        payload: 'test',
                        metadata: null
                    },
                    version: null
                }
            },
            result: {
                data: {
                    runActionsListAndFormatOnValue: [
                        {
                            __typename: 'GenericValue',
                            id_value: null,
                            payload: 'TEST',
                            raw_payload: 'test'
                        }
                    ]
                }
            }
        }
    ];

    test('should process given value', async () => {
        const {result} = renderHook(() => useRunActionsListAndFormatOnValue(), {
            wrapper: ({children}) => (
                <MockedProvider addTypename={false} mocks={successMock}>
                    {children as JSX.Element}
                </MockedProvider>
            )
        });

        let values;
        await act(async () => {
            values = await result.current.runActionsListAndFormatOnValue(
                'test_library',
                {
                    value: 'test',
                    idValue: null,
                    attribute: 'test_attribute'
                },
                null
            );
        });

        expect(values).toEqual({
            __typename: 'GenericValue',
            id_value: null,
            payload: 'TEST',
            raw_payload: 'test'
        });
    });
});
