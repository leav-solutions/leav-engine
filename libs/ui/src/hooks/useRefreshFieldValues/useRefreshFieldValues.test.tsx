// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {MockedProvider} from '@apollo/client/testing';
import {getRecordPropertiesQuery} from '_ui/_queries/records/getRecordPropertiesQuery';
import {act, renderHook} from '_ui/_tests/testUtils';
import useRefreshFieldValues from './useRefreshFieldValues';

describe('useRefetchFieldValues', () => {
    test('Fetch values and return it', async () => {
        const mocks = [
            {
                request: {
                    query: getRecordPropertiesQuery([
                        {
                            attributeId: 'my_attribute'
                        }
                    ]),
                    variables: {
                        library: 'test_lib',
                        recordId: '123456',
                        version: null
                    }
                },
                result: {
                    data: {
                        records: {
                            list: [
                                {
                                    _id: '123456',
                                    my_attribute: [
                                        {
                                            __typename: 'Value',
                                            value: 'my_value',
                                            raw_value: 'my_value',
                                            id_value: null,
                                            created_at: null,
                                            created_by: null,
                                            modified_at: null,
                                            modified_by: null,
                                            version: null
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const {result} = renderHook(() => useRefreshFieldValues('test_lib', 'my_attribute', '123456'), {
            wrapper: ({children}) => <MockedProvider mocks={mocks}>{children as JSX.Element}</MockedProvider>
        });

        let values;
        await act(async () => {
            values = await result.current.fetchValues();
        });

        expect(values).toEqual([
            {
                id_value: null,
                created_at: null,
                created_by: null,
                modified_at: null,
                modified_by: null,
                version: {},
                value: 'my_value',
                raw_value: 'my_value'
            }
        ]);
    });
});
