// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as gqlTypes from '_ui/_gqlTypes';
import {renderHook} from '_ui/_tests/testUtils';
import {useValuesDistribution} from './useValuesDistribution';

const libraryId = 'test_library';
const attributeId = 'test_attribute';
const recordFilters = [];

describe('useValuesDistribution', () => {
    describe('initial loading state', () => {
        it('should return loading=true, distribution=[] and noValueCount=0', () => {
            jest.spyOn(gqlTypes, 'useValuesOccurrencesQuery').mockReturnValue({
                data: undefined,
                loading: true,
            } as gqlTypes.ValuesOccurrencesQueryResult);

            const {result} = renderHook(() => useValuesDistribution({libraryId, attributeId, recordFilters}));

            expect(result.current.loading).toBe(true);
            expect(result.current.distribution).toEqual([]);
            expect(result.current.noValueCount).toBe(0);
        });
    });

    describe('when response is contains entries without and with treeNode', () => {
        it('should correctly split distribution and noValueCount', () => {
            jest.spyOn(gqlTypes, 'useValuesOccurrencesQuery').mockReturnValue({
                data: {
                    listDistinctValues: [
                        {count: 4},
                        {count: 2, treeNode: {id: 'node_1'}},
                        {count: 8, treeNode: {id: 'node_2'}},
                    ],
                },
                loading: false,
            } as gqlTypes.ValuesOccurrencesQueryResult);

            const {result} = renderHook(() => useValuesDistribution({libraryId, attributeId, recordFilters}));

            expect(result.current.noValueCount).toBe(4);
            expect(result.current.distribution).toEqual([
                {count: 2, treeNodeId: 'node_1'},
                {count: 8, treeNodeId: 'node_2'},
            ]);
        });

        it('should exclude entries with treeNode=null from distribution', () => {
            jest.spyOn(gqlTypes, 'useValuesOccurrencesQuery').mockReturnValue({
                data: {
                    listDistinctValues: [
                        {count: 6, treeNode: null},
                        {count: 3, treeNode: {id: 'node_1'}},
                    ],
                },
                loading: false,
            } as gqlTypes.ValuesOccurrencesQueryResult);

            const {result} = renderHook(() => useValuesDistribution({libraryId, attributeId, recordFilters}));

            expect(result.current.noValueCount).toBe(6);
            expect(result.current.distribution).toEqual([{count: 3, treeNodeId: 'node_1'}]);
        });
    });
});
