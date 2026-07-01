import * as gqlTypes from '_ui/_gqlTypes';
import {renderHook} from '_ui/_tests/testUtils';
import {useTreeNodesCandidates} from './useTreeNodesCandidates';

const libraryId = 'test_library';
const attributeId = 'test_attribute';
const recordFilters = [];

describe('useTreeNodesCandidates', () => {
    describe('initial loading state', () => {
        it('should return loading=true and empty candidateNodes', () => {
            vi.spyOn(gqlTypes, 'useTreeAttributeRemappingQuery').mockReturnValue({
                data: undefined,
                loading: true,
            } as gqlTypes.TreeAttributeRemappingQueryResult);

            const {result} = renderHook(() =>
                useTreeNodesCandidates({libraryId, attributeId, massSelectionFilters: recordFilters}),
            );

            expect(result.current.loading).toBe(true);
            expect(result.current.candidateNodes).toEqual([]);
        });
    });

    describe('when query returns nodes', () => {
        it('should return only nodes present in the selection with their occurrence count and resolved allowed values', () => {
            vi.spyOn(gqlTypes, 'useTreeAttributeRemappingQuery').mockReturnValue({
                data: {
                    listDistinctValues: [{count: 3, treeNode: {id: 'node_1'}}],
                    attributes: {
                        list: [
                            {
                                tree_values: [
                                    {
                                        node: {
                                            id: 'node_1',
                                            record: {id: 'rec_1', whoAmI: {label: 'Node 1', color: '#ff0000'}},
                                        },
                                        allowedDependentValues: [{nodeId: 'node_2'}],
                                    },
                                    {
                                        node: {
                                            id: 'node_2',
                                            record: {id: 'rec_2', whoAmI: {label: 'Node 2', color: null}},
                                        },
                                        allowedDependentValues: [],
                                    },
                                ],
                            },
                        ],
                    },
                },
                loading: false,
            } as unknown as gqlTypes.TreeAttributeRemappingQueryResult);

            const {result} = renderHook(() =>
                useTreeNodesCandidates({libraryId, attributeId, massSelectionFilters: recordFilters}),
            );

            expect(result.current.candidateNodes).toHaveLength(1);
            expect(result.current.candidateNodes[0]).toEqual({
                currentNode: {id: 'node_1', label: 'Node 1', color: '#ff0000'},
                occurrenceCount: 3,
                allowedDependentValues: [{id: 'node_2', label: 'Node 2', color: null}],
            });
        });

        it('should add a null candidateNode with allowed targets defined by the null tree_values entry', () => {
            vi.spyOn(gqlTypes, 'useTreeAttributeRemappingQuery').mockReturnValue({
                data: {
                    listDistinctValues: [{count: 5, treeNode: null}],
                    attributes: {
                        list: [
                            {
                                tree_values: [
                                    {
                                        node: {
                                            id: 'node_1',
                                            record: {id: 'rec_1', whoAmI: {label: 'Node 1', color: '#ff0000'}},
                                        },
                                        allowedDependentValues: [],
                                    },
                                    {
                                        node: {
                                            id: 'node_2',
                                            record: {id: 'rec_2', whoAmI: {label: 'Node 2', color: null}},
                                        },
                                        allowedDependentValues: [],
                                    },
                                    {
                                        node: null,
                                        allowedDependentValues: [{nodeId: 'node_1'}],
                                    },
                                ],
                            },
                        ],
                    },
                },
                loading: false,
            } as unknown as gqlTypes.TreeAttributeRemappingQueryResult);

            const {result} = renderHook(() =>
                useTreeNodesCandidates({libraryId, attributeId, massSelectionFilters: recordFilters}),
            );

            expect(result.current.candidateNodes).toHaveLength(1);
            expect(result.current.candidateNodes[0].currentNode.id).toBeNull();
            expect(result.current.candidateNodes[0].currentNode.label).toBe(
                'explorer.massAction.editAttribute_value_undefined',
            );
            expect(result.current.candidateNodes[0].occurrenceCount).toBe(5);
            expect(result.current.candidateNodes[0].allowedDependentValues).toEqual([
                {id: 'node_1', label: 'Node 1', color: '#ff0000'},
            ]);
        });

        it('should return all remappable nodes as allowedDependentValues when allowedDependentValues is null (no restriction)', () => {
            vi.spyOn(gqlTypes, 'useTreeAttributeRemappingQuery').mockReturnValue({
                data: {
                    listDistinctValues: [{count: 3, treeNode: {id: 'node_1'}}],
                    attributes: {
                        list: [
                            {
                                tree_values: [
                                    {
                                        node: {
                                            id: 'node_1',
                                            record: {id: 'rec_1', whoAmI: {label: 'Node 1', color: '#ff0000'}},
                                        },
                                        allowedDependentValues: null,
                                    },
                                    {
                                        node: {
                                            id: 'node_2',
                                            record: {id: 'rec_2', whoAmI: {label: 'Node 2', color: null}},
                                        },
                                        allowedDependentValues: null,
                                    },
                                ],
                            },
                        ],
                    },
                },
                loading: false,
            } as unknown as gqlTypes.TreeAttributeRemappingQueryResult);

            const {result} = renderHook(() =>
                useTreeNodesCandidates({libraryId, attributeId, massSelectionFilters: recordFilters}),
            );

            expect(result.current.candidateNodes).toHaveLength(1);
            expect(result.current.candidateNodes[0].allowedDependentValues).toEqual([
                {id: 'node_1', label: 'Node 1', color: '#ff0000'},
                {id: 'node_2', label: 'Node 2', color: null},
            ]);
        });

        it('should return empty allowedDependentValues for the null candidateNode when the null tree_values entry has no allowed transitions', () => {
            vi.spyOn(gqlTypes, 'useTreeAttributeRemappingQuery').mockReturnValue({
                data: {
                    listDistinctValues: [{count: 5, treeNode: null}],
                    attributes: {
                        list: [
                            {
                                tree_values: [
                                    {
                                        node: {
                                            id: 'node_1',
                                            record: {id: 'rec_1', whoAmI: {label: 'Node 1', color: '#ff0000'}},
                                        },
                                        allowedDependentValues: [],
                                    },
                                    {node: null, allowedDependentValues: []},
                                ],
                            },
                        ],
                    },
                },
                loading: false,
            } as unknown as gqlTypes.TreeAttributeRemappingQueryResult);

            const {result} = renderHook(() =>
                useTreeNodesCandidates({libraryId, attributeId, massSelectionFilters: recordFilters}),
            );

            expect(result.current.candidateNodes).toHaveLength(1);
            expect(result.current.candidateNodes[0].currentNode.id).toBeNull();
            expect(result.current.candidateNodes[0].allowedDependentValues).toEqual([]);
        });
    });
});
