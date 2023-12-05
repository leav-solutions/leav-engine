// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {getRecordPropertiesQuery} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {act, renderHook} from '_tests/testUtils';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
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
            wrapper: ({children}) => (
                <MockedProviderWithFragments mocks={mocks}>{children as JSX.Element}</MockedProviderWithFragments>
            )
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
