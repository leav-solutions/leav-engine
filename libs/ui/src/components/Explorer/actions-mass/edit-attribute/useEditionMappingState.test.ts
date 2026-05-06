// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, renderHook} from '_ui/_tests/testUtils';
import {useEditionMappingState} from './useEditionMappingState';

const dependencyFilterA = {field: 'status', value: 'active'};
const dependencyFilterB = {field: 'status', value: 'inactive'};

describe('useEditionMappingState', () => {
    describe('resetEditionMapping', () => {
        test('should reset mapping to initial state', () => {
            const {result} = renderHook(() => useEditionMappingState());

            act(() => result.current.applyMappingChange({before: 'node_1', after: 'node_2', occurrenceCount: 3}));
            act(() => result.current.resetEditionMapping());

            expect(result.current.editionMapping).toEqual({count: 0, mapping: []});
        });
    });

    describe('applyMappingChange', () => {
        test('should add the mapping and increment count', () => {
            const {result} = renderHook(() => useEditionMappingState());

            act(() => result.current.applyMappingChange({before: 'node_1', after: 'node_2', occurrenceCount: 3}));

            expect(result.current.editionMapping).toEqual({
                count: 3,
                mapping: [{values: [{before: 'node_1', after: 'node_2'}]}],
            });
        });

        test('should remove the mapping and decrement count when before equals after', () => {
            const {result} = renderHook(() => useEditionMappingState());

            act(() => result.current.applyMappingChange({before: 'node_1', after: 'node_2', occurrenceCount: 3}));
            act(() => result.current.applyMappingChange({before: 'node_1', after: 'node_1', occurrenceCount: 3}));

            expect(result.current.editionMapping).toEqual({
                count: 0,
                mapping: [{values: []}],
            });
        });
    });

    describe('applyMonoDependencyWorkflowChange', () => {
        test('should create the first bucket when no mapping exists', () => {
            const {result} = renderHook(() => useEditionMappingState());

            act(() =>
                result.current.applyMonoDependencyWorkflowChange({
                    before: 'node_1',
                    after: 'node_2',
                    occurrenceCount: 5,
                    dependencyFilter: dependencyFilterA,
                }),
            );

            expect(result.current.editionMapping).toEqual({
                count: 5,
                mapping: [{dependenciesFilters: [dependencyFilterA], values: [{before: 'node_1', after: 'node_2'}]}],
            });
        });

        test('should create a new bucket when no existing bucket matches the dependency filter', () => {
            const {result} = renderHook(() => useEditionMappingState());

            act(() =>
                result.current.applyMonoDependencyWorkflowChange({
                    before: 'node_1',
                    after: 'node_2',
                    occurrenceCount: 5,
                    dependencyFilter: dependencyFilterA,
                }),
            );
            act(() =>
                result.current.applyMonoDependencyWorkflowChange({
                    before: 'node_3',
                    after: 'node_4',
                    occurrenceCount: 2,
                    dependencyFilter: dependencyFilterB,
                }),
            );

            expect(result.current.editionMapping).toEqual({
                count: 7,
                mapping: [
                    {dependenciesFilters: [dependencyFilterA], values: [{before: 'node_1', after: 'node_2'}]},
                    {dependenciesFilters: [dependencyFilterB], values: [{before: 'node_3', after: 'node_4'}]},
                ],
            });
        });

        test('should update the matching bucket when the dependency filter already exists', () => {
            const {result} = renderHook(() => useEditionMappingState());

            act(() =>
                result.current.applyMonoDependencyWorkflowChange({
                    before: 'node_1',
                    after: 'node_2',
                    occurrenceCount: 5,
                    dependencyFilter: dependencyFilterA,
                }),
            );
            act(() =>
                result.current.applyMonoDependencyWorkflowChange({
                    before: 'node_3',
                    after: 'node_4',
                    occurrenceCount: 2,
                    dependencyFilter: dependencyFilterA,
                }),
            );

            expect(result.current.editionMapping).toEqual({
                count: 7,
                mapping: [
                    {
                        dependenciesFilters: [dependencyFilterA],
                        values: [
                            {before: 'node_1', after: 'node_2'},
                            {before: 'node_3', after: 'node_4'},
                        ],
                    },
                ],
            });
        });

        test('should remove the value from its bucket and decrement count when before equals after', () => {
            const {result} = renderHook(() => useEditionMappingState());

            act(() =>
                result.current.applyMonoDependencyWorkflowChange({
                    before: 'node_1',
                    after: 'node_2',
                    occurrenceCount: 5,
                    dependencyFilter: dependencyFilterA,
                }),
            );
            act(() =>
                result.current.applyMonoDependencyWorkflowChange({
                    before: 'node_1',
                    after: 'node_1',
                    occurrenceCount: 5,
                    dependencyFilter: dependencyFilterA,
                }),
            );

            expect(result.current.editionMapping).toEqual({
                count: 0,
                mapping: [{dependenciesFilters: [dependencyFilterA], values: []}],
            });
        });
    });
});
