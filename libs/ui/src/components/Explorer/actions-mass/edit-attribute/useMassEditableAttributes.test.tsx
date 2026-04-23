// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as gqlTypes from '_ui/_gqlTypes';
import {renderHook} from '_ui/_tests/testUtils';
import {useMassEditableAttributes} from './useMassEditableAttributes';

const libraryId = 'test_library';
const attributeId = 'attr_1';

describe('useMassEditableAttributes', () => {
    describe('when libraryId is empty', () => {
        it('should skip the query and return an empty array', () => {
            jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue({
                data: undefined,
                loading: false,
            } as unknown as gqlTypes.MassEditableAttributesQueryResult);

            const {result} = renderHook(() => useMassEditableAttributes({libraryId: ''}));

            expect(gqlTypes.useMassEditableAttributesQuery).toHaveBeenCalledWith(expect.objectContaining({skip: true}));
            expect(result.current).toEqual([]);
        });
    });

    describe('when query returns no data', () => {
        it('should return an empty array', () => {
            jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue({
                data: undefined,
                loading: false,
            } as unknown as gqlTypes.MassEditableAttributesQueryResult);

            const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

            expect(result.current).toEqual([]);
        });
    });

    describe('when attribute has no dependency or tree fields', () => {
        it('should return the attribute with empty dependencies, empty treeNodes and hasEmptyDependency=true', () => {
            jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue({
                data: {
                    attributes: {
                        list: [{id: attributeId, label: {fr: 'Attribut 1'}}],
                    },
                },
                loading: false,
            } as unknown as gqlTypes.MassEditableAttributesQueryResult);

            const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

            expect(result.current).toHaveLength(1);
            expect(result.current[0]).toEqual(
                expect.objectContaining({
                    id: attributeId,
                    dependencies: [],
                    treeNodes: [],
                    hasEmptyDependency: true,
                    isSimpleWorkflow: false,
                    isMonoDependencyWorkflow: false,
                }),
            );
        });
    });

    describe('when attribute has permissions_conf_dependent_values', () => {
        describe('with a single dependency matching the attribute id', () => {
            it('should set isSimpleWorkflow=true', () => {
                jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue({
                    data: {
                        attributes: {
                            list: [
                                {
                                    id: attributeId,
                                    label: {fr: 'Attribut 1'},
                                    permissions_conf_dependent_values: {
                                        dependenciesTreeAttributes: [{id: attributeId, label: {fr: 'Attribut 1'}}],
                                    },
                                },
                            ],
                        },
                    },
                    loading: false,
                } as unknown as gqlTypes.MassEditableAttributesQueryResult);

                const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

                expect(result.current[0].isSimpleWorkflow).toBe(true);
                expect(result.current[0].hasEmptyDependency).toBe(false);
                expect(result.current[0].isMonoDependencyWorkflow).toBe(false);
            });
        });

        describe.skip('with two dependencies and one matching the attribute id', () => {
            it('should set isMonoDependencyWorkflow=true', () => {
                jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue({
                    data: {
                        attributes: {
                            list: [
                                {
                                    id: attributeId,
                                    label: {fr: 'Attribut 1'},
                                    permissions_conf_dependent_values: {
                                        dependenciesTreeAttributes: [
                                            {id: attributeId, label: {fr: 'Attribut 1'}},
                                            {id: 'attr_2', label: {fr: 'Attribut 2'}},
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    loading: false,
                } as unknown as gqlTypes.MassEditableAttributesQueryResult);

                const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

                expect(result.current[0].isMonoDependencyWorkflow).toBe(true);
                expect(result.current[0].hasEmptyDependency).toBe(false);
                expect(result.current[0].isSimpleWorkflow).toBe(false);
            });
        });
    });

    describe('filtering — which attributes are returned', () => {
        const mockAttributeWithDeps = (deps: Array<{id: string}>) =>
            ({
                data: {
                    attributes: {
                        list: [
                            {
                                id: attributeId,
                                label: {fr: 'Attribut 1'},
                                permissions_conf_dependent_values: {
                                    dependenciesTreeAttributes: deps,
                                },
                            },
                        ],
                    },
                },
                loading: false,
            }) as unknown as gqlTypes.MassEditableAttributesQueryResult;

        it('should include an attribute with no dependency (hasEmptyDependency)', () => {
            jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue({
                data: {
                    attributes: {
                        list: [{id: attributeId, label: {fr: 'Attribut 1'}}],
                    },
                },
                loading: false,
            } as unknown as gqlTypes.MassEditableAttributesQueryResult);

            const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

            expect(result.current).toHaveLength(1);
        });

        it('should include an attribute with a single dependency matching itself (isSimpleWorkflow)', () => {
            jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue(
                mockAttributeWithDeps([{id: attributeId}]),
            );

            const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

            expect(result.current).toHaveLength(1);
        });

        it('should not include an attribute with two dependencies where one matches itself (isMonoDependencyWorkflow)', () => {
            jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue(
                mockAttributeWithDeps([{id: attributeId}, {id: 'attr_2'}]),
            );

            const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

            expect(result.current).toHaveLength(0);
        });

        it('should exclude an attribute with more than two dependencies', () => {
            jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue(
                mockAttributeWithDeps([{id: 'attr_2'}, {id: 'attr_3'}, {id: 'attr_4'}]),
            );

            const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

            expect(result.current).toHaveLength(0);
        });
    });

    describe('when attribute has tree_values', () => {
        describe('with a valid node', () => {
            it('should map treeNode with id, label, color and allowedDependentNodeIds', () => {
                jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue({
                    data: {
                        attributes: {
                            list: [
                                {
                                    id: attributeId,
                                    label: {fr: 'Attribut 1'},
                                    tree_values: [
                                        {
                                            node: {
                                                id: 'node_1',
                                                record: {
                                                    id: 'record_1',
                                                    whoAmI: {label: 'Record 1', color: '#ff0000'},
                                                },
                                            },
                                            allowedDependentValues: [{nodeId: 'node_2'}, {nodeId: 'node_3'}],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                    loading: false,
                } as unknown as gqlTypes.MassEditableAttributesQueryResult);

                const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

                expect(result.current[0].treeNodes).toEqual([
                    {
                        id: 'node_1',
                        label: 'Record 1',
                        color: '#ff0000',
                        allowedDependentNodeIds: ['node_2', 'node_3'],
                    },
                ]);
            });
        });

        describe('with a null node', () => {
            it('should set treeNode id to null and use the translation fallback as label', () => {
                jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue({
                    data: {
                        attributes: {
                            list: [
                                {
                                    id: attributeId,
                                    label: {fr: 'Attribut 1'},
                                    tree_values: [{node: null, allowedDependentValues: []}],
                                },
                            ],
                        },
                    },
                    loading: false,
                } as unknown as gqlTypes.MassEditableAttributesQueryResult);

                const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

                expect(result.current[0].treeNodes[0].id).toBeNull();
                expect(result.current[0].treeNodes[0].label).toBe('explorer.massAction.editAttribute_value_undefined');
            });
        });

        describe('with no allowedDependentValues', () => {
            it('should set allowedDependentNodeIds to an empty array', () => {
                jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue({
                    data: {
                        attributes: {
                            list: [
                                {
                                    id: attributeId,
                                    label: {fr: 'Attribut 1'},
                                    tree_values: [
                                        {
                                            node: {
                                                id: 'node_1',
                                                record: {
                                                    id: 'record_1',
                                                    whoAmI: {label: 'Record 1', color: null},
                                                },
                                            },
                                            allowedDependentValues: null,
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                    loading: false,
                } as unknown as gqlTypes.MassEditableAttributesQueryResult);

                const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

                expect(result.current[0].treeNodes[0].allowedDependentNodeIds).toEqual([]);
            });
        });
    });
});
