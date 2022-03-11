// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '@testing-library/react-hooks';
import useGraphqlPossibleTypes from './useGraphqlPossibleTypes';

// jest.mock('fetch', () =>
//     Promise.resolve({
//         json: () => Promise.resolve({})
//     })
// );

describe('useGraphqlPossibleTypes', () => {
    test('Return loading then possible types', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            json: () =>
                Promise.resolve({
                    data: {
                        __schema: {
                            types: [
                                {
                                    kind: 'INTERFACE',
                                    name: 'Record',
                                    possibleTypes: [
                                        {
                                            name: 'Categorie'
                                        },
                                        {
                                            name: 'File'
                                        },
                                        {
                                            name: 'Product'
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    extensions: {
                        tracing: {
                            version: 1,
                            startTime: '2021-06-22T07:57:52.979Z',
                            endTime: '2021-06-22T07:57:52.981Z',
                            duration: 1423656,
                            execution: {
                                resolvers: []
                            }
                        }
                    }
                })
        } as Response);

        const hook = renderHook(() => useGraphqlPossibleTypes('myUrl', 'myToken'));
        const {result} = hook;

        expect(result.current.loading).toBe(true);

        await hook.waitForNextUpdate();

        expect(result.current.loading).toBe(false);
        expect(result.current.possibleTypes).toBeDefined();
        expect(result.current.possibleTypes.Record).toHaveLength(3);
    });

    test('Return loading then error', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValue('Boom!');

        const hook = renderHook(() => useGraphqlPossibleTypes('myUrl', 'myToken'));
        const {result} = hook;

        expect(result.current.loading).toBe(true);

        await hook.waitForNextUpdate();

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Boom!');
        expect(result.current.possibleTypes).not.toBeDefined();
    });
});
