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
        it('should return the attribute with empty dependencies and hasEmptyDependency=true', () => {
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
                                        dependenciesTreeAttributes: [
                                            {
                                                id: attributeId,
                                                label: {fr: 'Attribut 1'},
                                                linked_tree: {libraries: [{library: {id: 'tree_lib_1'}}]},
                                            },
                                        ],
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
                expect(result.current[0].dependencies[0]).toEqual({
                    id: attributeId,
                    label: {fr: 'Attribut 1'},
                    linkedTreeLibraryId: 'tree_lib_1',
                });
            });
        });

        describe('with two dependencies and one matching the attribute id', () => {
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
                                            {
                                                id: attributeId,
                                                label: {fr: 'Attribut 1'},
                                                linked_tree: {libraries: [{library: {id: 'tree_lib_1'}}]},
                                            },
                                            {
                                                id: 'attr_2',
                                                label: {fr: 'Attribut 2'},
                                                linked_tree: {libraries: [{library: {id: 'tree_lib_2'}}]},
                                            },
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

        describe('with a dependency whose linked_tree has more than one library', () => {
            it('should not include it in dependencies', () => {
                jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue({
                    data: {
                        attributes: {
                            list: [
                                {
                                    id: attributeId,
                                    label: {fr: 'Attribut 1'},
                                    permissions_conf_dependent_values: {
                                        dependenciesTreeAttributes: [
                                            {
                                                id: attributeId,
                                                label: {fr: 'Attribut 1'},
                                                linked_tree: {
                                                    libraries: [
                                                        {library: {id: 'tree_lib_1'}},
                                                        {library: {id: 'tree_lib_2'}},
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    loading: false,
                } as unknown as gqlTypes.MassEditableAttributesQueryResult);

                const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

                expect(result.current[0].dependencies).toEqual([]);
                expect(result.current[0].hasEmptyDependency).toBe(true);
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
                                    dependenciesTreeAttributes: deps.map(dep => ({
                                        ...dep,
                                        linked_tree: {libraries: [{library: {id: `${dep.id}_tree_lib`}}]},
                                    })),
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

        it('should include an attribute with two dependencies where one matches itself (isMonoDependencyWorkflow)', () => {
            jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue(
                mockAttributeWithDeps([{id: attributeId}, {id: 'attr_2'}]),
            );

            const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

            expect(result.current).toHaveLength(1);
        });

        it('should exclude an attribute with more than two dependencies', () => {
            jest.spyOn(gqlTypes, 'useMassEditableAttributesQuery').mockReturnValue(
                mockAttributeWithDeps([{id: 'attr_2'}, {id: 'attr_3'}, {id: 'attr_4'}]),
            );

            const {result} = renderHook(() => useMassEditableAttributes({libraryId}));

            expect(result.current).toHaveLength(0);
        });
    });
});
