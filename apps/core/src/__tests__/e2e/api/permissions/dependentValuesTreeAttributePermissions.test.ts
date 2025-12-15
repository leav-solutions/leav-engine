// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeTypes, type IAttribute} from '../../../../_types/attribute';
import {gqlSaveAttribute, gqlSaveLibrary, gqlSaveTree, makeGraphQlCall} from '../e2eUtils';

describe('DependentValuesTreeAttributePermissions', () => {
    const testAttrName = 'test_dependent_values_tree_attribute_itself';
    const testLibraryName = 'test_dependent_values_tree_attribute_library';
    const testTreeLibraryName = 'test_dependent_values_tree_attribute_tree_library';
    const testTreeName = 'test_dependent_values_tree_attribute_attr_tree';

    beforeAll(async () => {
        await gqlSaveLibrary(testTreeLibraryName, 'Test node lib', []);
        await gqlSaveTree(testTreeName, 'Attribute tree', [testTreeLibraryName]);

        await gqlSaveAttribute({
            id: testAttrName,
            label: 'Test Attr tree record',
            type: AttributeTypes.TREE,
            linkedTree: testTreeName,
            multipleValues: false,
        });

        await gqlSaveLibrary(testLibraryName, 'Test node lib', [testAttrName]);
    });

    describe('dependent on itself', () => {
        beforeAll(async () => {
            await gqlSaveAttribute({
                id: testAttrName,
                label: 'Test Dependent Values Tree Attribute on itself',
                type: AttributeTypes.TREE,
                linkedTree: testTreeName,
                multipleValues: false,
                permissions_conf_dependent_values: {
                    dependentValuesTreeAttributes: [testAttrName],
                },
            });
        });

        it('should save and retrieve the attribute', async () => {
            const attribute = await getAttribute(testAttrName);

            expect(attribute.permissions_conf_dependent_values.dependentValuesTreeAttributes).toEqual([
                expect.objectContaining({id: testAttrName}),
            ]);
        });
    });

    describe('another tree attribute exists', () => {
        const anotherAttrName = 'another_dependent_values_tree_attribute';
        const anotherTreeName = 'another_dependent_values_tree_attribute_attr_tree';
        beforeAll(async () => {
            await gqlSaveTree(anotherTreeName, 'Another Attribute tree', [testTreeLibraryName]);

            await gqlSaveAttribute({
                id: anotherAttrName,
                label: 'Dependent Attr',
                type: AttributeTypes.TREE,
                linkedTree: anotherTreeName,
                multipleValues: false,
            });

            await gqlSaveLibrary(testLibraryName, 'Test node lib', [testAttrName, anotherAttrName]);
        });

        describe('dependent on another tree attribute', () => {
            beforeAll(async () => {
                await gqlSaveAttribute({
                    id: testAttrName,
                    label: 'Test Dependent Values Tree Attribute on another attr',
                    type: AttributeTypes.TREE,
                    linkedTree: testTreeName,
                    multipleValues: false,
                    permissions_conf_dependent_values: {
                        dependentValuesTreeAttributes: [anotherAttrName],
                    },
                });
            });

            it('should save and retrieve the attribute', async () => {
                const attribute = await getAttribute(testAttrName);

                expect(attribute.permissions_conf_dependent_values.dependentValuesTreeAttributes).toEqual([
                    expect.objectContaining({id: anotherAttrName}),
                ]);
            });
        });

        describe('dependent on another tree attribute and itself', () => {
            beforeAll(async () => {
                await gqlSaveAttribute({
                    id: testAttrName,
                    label: 'Test Dependent Values Tree Attribute on another attr and itself',
                    type: AttributeTypes.TREE,
                    linkedTree: testTreeName,
                    multipleValues: false,
                    permissions_conf_dependent_values: {
                        dependentValuesTreeAttributes: [anotherAttrName, testAttrName],
                    },
                });
            });

            it('should save and retrieve the attribute', async () => {
                const attribute = await getAttribute(testAttrName);

                expect(attribute.permissions_conf_dependent_values.dependentValuesTreeAttributes).toEqual([
                    expect.objectContaining({id: anotherAttrName}),
                    expect.objectContaining({id: testAttrName}),
                ]);
            });
        });
    });

    describe('save wrong attribute with permissions_conf_dependent_values', () => {
        it('should fail if dependent is unknown', async () => {
            await expect(
                gqlSaveAttribute({
                    id: testAttrName,
                    label: 'Test Dependent Values Tree Attribute with unknown dependent',
                    type: AttributeTypes.TREE,
                    linkedTree: testTreeName,
                    multipleValues: false,
                    permissions_conf_dependent_values: {
                        dependentValuesTreeAttributes: ['unknown_attribute_id'],
                    },
                }),
            ).rejects.toThrow(/Invalid attributes: unknown_attribute_id/);
        });

        it('should fail if attribute has wrong type', async () => {
            await expect(
                gqlSaveAttribute({
                    id: 'test_dependent_values_tree_attribute_link',
                    label: 'Test Dependent Values Tree Attribute with wrong type',
                    type: AttributeTypes.SIMPLE_LINK,
                    linkedTree: testTreeName,
                    permissions_conf_dependent_values: {
                        dependentValuesTreeAttributes: [testAttrName],
                    },
                }),
            ).rejects.toThrow(
                /Cannot save permissions dependent values: attribute type is simple_link, must be of type tree/,
            );
        });

        it('should fail if dependent values tree attribute has wrong type', async () => {
            await gqlSaveAttribute({
                id: 'test_dependent_values_tree_attribute_simple',
                label: 'Test Attr simple',
                type: AttributeTypes.SIMPLE,
            });

            await expect(
                gqlSaveAttribute({
                    id: 'test_dependent_values_tree_attribute_with_simple',
                    label: 'Test Dependent Values Tree Attribute with dependent simple type',
                    type: AttributeTypes.TREE,
                    linkedTree: testTreeName,
                    permissions_conf_dependent_values: {
                        dependentValuesTreeAttributes: ['test_dependent_values_tree_attribute_simple'],
                    },
                }),
            ).rejects.toThrow(/Invalid attributes: test_dependent_values_tree_attribute_simple/);
        });

        it('should fail if dependent values tree attribute is tree but multi value', async () => {
            await gqlSaveAttribute({
                id: 'test_dependent_values_tree_attribute_tree_multivalue',
                label: 'Test Attr tree multivalue',
                type: AttributeTypes.TREE,
                linkedTree: testTreeName,
                multipleValues: true,
            });

            await expect(
                gqlSaveAttribute({
                    id: 'test_dependent_values_tree_attribute_with_tree_multivalue',
                    label: 'Test Dependent Values Tree Attribute with dependent tree multivalue',
                    type: AttributeTypes.TREE,
                    linkedTree: testTreeName,
                    permissions_conf_dependent_values: {
                        dependentValuesTreeAttributes: ['test_dependent_values_tree_attribute_tree_multivalue'],
                    },
                }),
            ).rejects.toThrow(/Invalid attributes: test_dependent_values_tree_attribute_tree_multivalue/);
        });
    });

    async function getAttribute(attrName: string): Promise<IAttribute> {
        const result = await makeGraphQlCall(
            `{attributes(filters: {id: "${attrName}"}) { 
                list {
                    id, 
                    ... on TreeAttribute {
                        permissions_conf_dependent_values {
                            dependentValuesTreeAttributes {
                                id
                            }
                        }
                    }
                }
            }}`,
        );

        expect(result.data.data.attributes.list.length).toBe(1);
        return result.data.data.attributes.list[0];
    }
});
