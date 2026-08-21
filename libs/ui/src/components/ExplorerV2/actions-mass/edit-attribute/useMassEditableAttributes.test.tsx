import {AttributeType} from '_ui/_gqlTypes';
import {renderHook} from '_ui/_tests/testUtils';
import {type AttributeProperties, type AttributesPropertiesById} from '../../_types';
import {useMassEditableAttributes} from './useMassEditableAttributes';

const attributeId = 'attr_1';

const makeTreeAttribute = (overrides: Partial<AttributeProperties> = {}): AttributeProperties =>
    ({
        id: attributeId,
        label: 'Attribut 1',
        type: AttributeType.tree,
        format: null,
        multiple_values: false,
        multi_link_display_option: null,
        multi_tree_display_option: null,
        ...overrides,
    }) as AttributeProperties;

describe('useMassEditableAttributes', () => {
    describe('when the attributes map is empty', () => {
        it('should return an empty array', () => {
            const {result} = renderHook(() => useMassEditableAttributes({}));

            expect(result.current).toEqual([]);
        });
    });

    describe('when attribute has no dependency or tree fields', () => {
        it('should return the attribute with empty dependencies and hasEmptyDependency=true', () => {
            const attributesProperties: AttributesPropertiesById = {[attributeId]: makeTreeAttribute()};

            const {result} = renderHook(() => useMassEditableAttributes(attributesProperties));

            expect(result.current).toHaveLength(1);
            expect(result.current[0]).toEqual(
                expect.objectContaining({
                    id: attributeId,
                    label: 'Attribut 1',
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
                const attributesProperties: AttributesPropertiesById = {
                    [attributeId]: makeTreeAttribute({
                        permissions_conf_dependent_values: {
                            dependenciesTreeAttributes: [
                                {
                                    id: attributeId,
                                    linked_tree: {libraries: [{library: {id: 'tree_lib_1'}}]},
                                },
                            ],
                        },
                    } as Partial<AttributeProperties>),
                };

                const {result} = renderHook(() => useMassEditableAttributes(attributesProperties));

                expect(result.current[0].isSimpleWorkflow).toBe(true);
                expect(result.current[0].hasEmptyDependency).toBe(false);
                expect(result.current[0].isMonoDependencyWorkflow).toBe(false);
                expect(result.current[0].dependencies[0]).toEqual({
                    id: attributeId,
                    linkedTreeLibraryId: 'tree_lib_1',
                });
            });
        });

        describe('with two dependencies and one matching the attribute id', () => {
            it('should set isMonoDependencyWorkflow=true', () => {
                const attributesProperties: AttributesPropertiesById = {
                    [attributeId]: makeTreeAttribute({
                        permissions_conf_dependent_values: {
                            dependenciesTreeAttributes: [
                                {
                                    id: attributeId,
                                    linked_tree: {libraries: [{library: {id: 'tree_lib_1'}}]},
                                },
                                {
                                    id: 'attr_2',
                                    linked_tree: {libraries: [{library: {id: 'tree_lib_2'}}]},
                                },
                            ],
                        },
                    } as Partial<AttributeProperties>),
                };

                const {result} = renderHook(() => useMassEditableAttributes(attributesProperties));

                expect(result.current[0].isMonoDependencyWorkflow).toBe(true);
                expect(result.current[0].hasEmptyDependency).toBe(false);
                expect(result.current[0].isSimpleWorkflow).toBe(false);
            });
        });

        describe('with a dependency whose linked_tree has more than one library', () => {
            it('should not include it in dependencies', () => {
                const attributesProperties: AttributesPropertiesById = {
                    [attributeId]: makeTreeAttribute({
                        permissions_conf_dependent_values: {
                            dependenciesTreeAttributes: [
                                {
                                    id: attributeId,
                                    linked_tree: {
                                        libraries: [{library: {id: 'tree_lib_1'}}, {library: {id: 'tree_lib_2'}}],
                                    },
                                },
                            ],
                        },
                    } as Partial<AttributeProperties>),
                };

                const {result} = renderHook(() => useMassEditableAttributes(attributesProperties));

                expect(result.current[0].dependencies).toEqual([]);
                expect(result.current[0].hasEmptyDependency).toBe(true);
            });
        });
    });

    describe('filtering — which attributes are returned', () => {
        const makeAttributeWithDeps = (deps: Array<{id: string}>): AttributesPropertiesById => ({
            [attributeId]: makeTreeAttribute({
                permissions_conf_dependent_values: {
                    dependenciesTreeAttributes: deps.map(dep => ({
                        ...dep,
                        linked_tree: {libraries: [{library: {id: `${dep.id}_tree_lib`}}]},
                    })),
                },
            } as Partial<AttributeProperties>),
        });

        it('should exclude a non-tree attribute', () => {
            const attributesProperties: AttributesPropertiesById = {
                [attributeId]: makeTreeAttribute({type: AttributeType.simple}),
            };

            const {result} = renderHook(() => useMassEditableAttributes(attributesProperties));

            expect(result.current).toHaveLength(0);
        });

        it('should exclude a multivalued tree attribute (server-side filter now gone)', () => {
            const attributesProperties: AttributesPropertiesById = {
                [attributeId]: makeTreeAttribute({multiple_values: true}),
            };

            const {result} = renderHook(() => useMassEditableAttributes(attributesProperties));

            expect(result.current).toHaveLength(0);
        });

        it('should include an attribute with no dependency (hasEmptyDependency)', () => {
            const attributesProperties: AttributesPropertiesById = {[attributeId]: makeTreeAttribute()};

            const {result} = renderHook(() => useMassEditableAttributes(attributesProperties));

            expect(result.current).toHaveLength(1);
        });

        it('should include an attribute with a single dependency matching itself (isSimpleWorkflow)', () => {
            const {result} = renderHook(() => useMassEditableAttributes(makeAttributeWithDeps([{id: attributeId}])));

            expect(result.current).toHaveLength(1);
        });

        it('should include an attribute with two dependencies where one matches itself (isMonoDependencyWorkflow)', () => {
            const {result} = renderHook(() =>
                useMassEditableAttributes(makeAttributeWithDeps([{id: attributeId}, {id: 'attr_2'}])),
            );

            expect(result.current).toHaveLength(1);
        });

        it('should exclude an attribute with more than two dependencies', () => {
            const {result} = renderHook(() =>
                useMassEditableAttributes(makeAttributeWithDeps([{id: 'attr_2'}, {id: 'attr_3'}, {id: 'attr_4'}])),
            );

            expect(result.current).toHaveLength(0);
        });
    });
});
