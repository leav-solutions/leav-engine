// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeDependentValuesPermissionsActions, PermissionTypes} from '../../../../_types/permissions';
import {AttributeTypes, type IAttribute} from '../../../../_types/attribute';
import {AttributeCondition} from '../../../../_types/record';
import {type ITreeValue} from '_types/value';
import {
    e2eNonAdminGroupId,
    e2eNonAdminUser,
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlSaveAttribute,
    gqlSaveLibrary,
    gqlSaveTree,
    makeGraphQlCall,
} from '../e2eUtils';

describe('DependentValuesTreeAttributePermissions', () => {
    const testAttrName = 'test_dependent_values_tree_attribute_itself';
    const testLibraryName = 'test_dependent_values_tree_attribute_library';
    const testTreeLibraryName = 'test_dependent_values_tree_attribute_tree_library';
    const testTreeName = 'test_dependent_values_tree_attribute_attr_tree';

    let treeNode1Id: string;
    let treeNode2Id: string;
    let treeNode3Id: string;
    let recordId: string;

    beforeAll(async () => {
        await gqlSaveLibrary(testTreeLibraryName, 'Test node lib', []);
        await gqlSaveTree(testTreeName, 'Attribute tree', [testTreeLibraryName]);

        const treeNodeRecord1Id = await gqlCreateRecord(testTreeLibraryName);
        const treeNodeRecord2Id = await gqlCreateRecord(testTreeLibraryName);
        const treeNodeRecord3Id = await gqlCreateRecord(testTreeLibraryName);

        treeNode1Id = await gqlAddElemToTree(testTreeName, {id: treeNodeRecord1Id, library: testTreeLibraryName});
        treeNode2Id = await gqlAddElemToTree(testTreeName, {id: treeNodeRecord2Id, library: testTreeLibraryName});
        treeNode3Id = await gqlAddElemToTree(testTreeName, {id: treeNodeRecord3Id, library: testTreeLibraryName});

        await gqlSaveAttribute({
            id: testAttrName,
            label: 'Test Attr tree record',
            type: AttributeTypes.TREE,
            linkedTree: testTreeName,
            multipleValues: false,
        });

        await gqlSaveLibrary(testLibraryName, 'Test node lib', [testAttrName]);
    });

    describe('dependent on itself (allowed_by_default)', () => {
        beforeAll(async () => {
            await gqlSaveAttribute({
                id: testAttrName,
                label: 'Test Dependent Values Tree Attribute on itself',
                type: AttributeTypes.TREE,
                linkedTree: testTreeName,
                multipleValues: false,
                permissions_conf_dependent_values: {
                    dependenciesTreeAttributes: [testAttrName],
                    allowByDefault: true,
                },
            });
        });

        it('should save and retrieve the attribute', async () => {
            const attribute = await getAttribute(testAttrName);

            expect(attribute.permissions_conf_dependent_values.dependenciesTreeAttributes).toEqual([
                expect.objectContaining({id: testAttrName}),
            ]);
        });

        describe('can not move from node1 to node2', () => {
            const setupPermission = (allowed: boolean | null) =>
                makeGraphQlCall(
                    `mutation {
                    savePermission(
                        permission: {
                            type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                            applyTo: "${testAttrName}",
                            usersGroup: null,
                            permissionTreeTarget: {
                                tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                            },
                            dependenciesTreeTargets: [
                                { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                            ],
                            actions: [
                                {name: ${AttributeDependentValuesPermissionsActions.SET_VALUE}, allowed: ${allowed}},
                            ]
                        }
                    ) { 
                        type
                    }
                }`,
                );

            beforeAll(async () => {
                await setupPermission(false);
            });

            afterAll(async () => {
                await setupPermission(null);
            });

            it('should have setup permission to use dependent values', async () => {
                const result = await makeGraphQlCall(
                    `{
                    permissions(
                        type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                        applyTo: "${testAttrName}",
                        usersGroup: null,
                        actions: [${AttributeDependentValuesPermissionsActions.SET_VALUE}],
                        permissionTreeTarget: {
                            tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                        },
                        dependenciesTreeTargets: [
                            { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                        ]
                    ) {
                        name
                        allowed
                    }
                }`,
                );

                expect(result.data.data.permissions.length).toBe(1);
                expect(result.data.data.permissions[0].name).toBe(AttributeDependentValuesPermissionsActions.SET_VALUE);
                expect(result.data.data.permissions[0].allowed).toBe(false);

                // with diff targeting, should inherit (null)
                const result2 = await makeGraphQlCall(
                    `{
                    permissions(
                        type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                        applyTo: "${testAttrName}",
                        usersGroup: null,
                        actions: [${AttributeDependentValuesPermissionsActions.SET_VALUE}],
                        permissionTreeTarget: {
                            tree: "${testTreeName}", nodeId: "${treeNode3Id}"
                        },
                        dependenciesTreeTargets: [
                            { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                        ]
                    ) {
                        name
                        allowed
                    }
                }`,
                );

                expect(result2.data.data.permissions[0].allowed).toBe(null);
            });

            describe('record have node1 value', () => {
                beforeEach(async () => {
                    const resCreateRecord = await makeGraphQlCall(`mutation {
                    c1: createRecord(library: "${testLibraryName}", data: {
                        values: [{ attribute: "${testAttrName}", payload: "${treeNode1Id}"}]
                    }) { record {id} },
                }`);
                    recordId = resCreateRecord.data.data.c1.record.id;
                });

                it('should not be allowed to set value node2', async () => {
                    expect(await isNonAdminAllowedToSetValueOnRecord(treeNode2Id)).toBe(false);

                    await expect(saveRecordAttributeTestValue(treeNode2Id)).rejects.toThrow(/Action forbidden/);
                    const values = await getRecordAttributeTestValues();
                    expect(values[0].payload.id).toBe(treeNode1Id);
                });

                it('should be allowed to set value node3', async () => {
                    expect(await isNonAdminAllowedToSetValueOnRecord(treeNode3Id)).toBe(true);

                    await saveRecordAttributeTestValue(treeNode3Id);
                    const values = await getRecordAttributeTestValues();
                    expect(values[0].payload.id).toBe(treeNode3Id);
                });

                it('should be allowed to set value null', async () => {
                    expect(await isNonAdminAllowedToSetValueOnRecord(null)).toBe(true);

                    await deleteRecordAttributeTestValue((await getRecordAttributeTestValues())[0].id_value);
                    const values = await getRecordAttributeTestValues();
                    expect(values.length).toBe(0);
                });

                it('treeNodeChildren with dependentValuesPermissionFilter should not contain node2', async () => {
                    const treeChildren = await getTreeNodeChildrenWithDependentValuesFilter();
                    expect(treeChildren).toHaveLength(2);
                    expect(treeChildren).toEqual(expect.arrayContaining([{id: treeNode1Id}, {id: treeNode3Id}]));
                });
            });
        });
    });

    describe('dependent on itself (not allowed_by_default)', () => {
        beforeAll(async () => {
            await gqlSaveAttribute({
                id: testAttrName,
                label: 'Test Dependent Values Tree Attribute on itself',
                type: AttributeTypes.TREE,
                linkedTree: testTreeName,
                multipleValues: false,
                permissions_conf_dependent_values: {
                    dependenciesTreeAttributes: [testAttrName],
                    allowByDefault: false,
                },
            });
        });

        it('should save and retrieve the attribute', async () => {
            const attribute = await getAttribute(testAttrName);

            expect(attribute.permissions_conf_dependent_values.dependenciesTreeAttributes).toEqual([
                expect.objectContaining({id: testAttrName}),
            ]);
        });

        it('Inherit permission should return false by default', async () => {
            const permInheritGroup = await makeGraphQlCall(`{
                p: inheritedPermissions(
                    type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                    applyTo: "${testAttrName}",
                    actions: [${AttributeDependentValuesPermissionsActions.SET_VALUE}],
                    permissionTreeTarget: {
                        tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                    },
                    dependenciesTreeTargets: [
                        { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                    ],
                    userGroupNodeId: "${e2eNonAdminGroupId()}"
                ) { name allowed }
            }
            `);

            expect(permInheritGroup.data.data.p[0].allowed).toBe(false);
        });

        it('should not be allowed to create record with attr defined value', async () => {
            const resCreateRecord = await makeGraphQlCall(`mutation {
                c1: createRecord(library: "${testLibraryName}", data: {
                    values: [{ attribute: "${testAttrName}", payload: "${treeNode1Id}"}]
                }) { 
                    record {id}
                    valuesErrors {
                        message
                        attribute
                    }
                 },
            }`);
            expect(resCreateRecord.data.data.c1.record).toBeNull();
            expect(resCreateRecord.data.data.c1.valuesErrors).toEqual([
                expect.objectContaining({
                    attribute: testAttrName,
                    message: 'Action forbidden',
                }),
            ]);
        });

        describe('can only move from null to node1 and node1 to node2', () => {
            const setupPermission = (allowed: boolean | null) =>
                makeGraphQlCall(
                    `mutation {
                    s1: savePermission(
                        permission: {
                            type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                            applyTo: "${testAttrName}",
                            usersGroup: null,
                            permissionTreeTarget: {
                                tree: "${testTreeName}", nodeId: "${treeNode1Id}"
                            },
                            dependenciesTreeTargets: [
                                { tree: "${testTreeName}", nodeId: null, attributeId: "${testAttrName}" }
                            ],
                            actions: [
                                {name: ${AttributeDependentValuesPermissionsActions.SET_VALUE}, allowed: ${allowed}},
                            ]
                        }
                    ) { 
                        type
                    }
                    s2: savePermission(
                        permission: {
                            type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                            applyTo: "${testAttrName}",
                            usersGroup: null,
                            permissionTreeTarget: {
                                tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                            },
                            dependenciesTreeTargets: [
                                { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                            ],
                            actions: [
                                {name: ${AttributeDependentValuesPermissionsActions.SET_VALUE}, allowed: ${allowed}},
                            ]
                        }
                    ) { 
                        type
                    }
                }`,
                );

            beforeAll(async () => {
                await setupPermission(true);
            });

            afterAll(async () => {
                await setupPermission(null);
            });

            it('should have setup permission to use dependent values', async () => {
                const result = await makeGraphQlCall(
                    `{
                    permissions(
                        type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                        applyTo: "${testAttrName}",
                        usersGroup: null,
                        actions: [${AttributeDependentValuesPermissionsActions.SET_VALUE}],
                        permissionTreeTarget: {
                            tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                        },
                        dependenciesTreeTargets: [
                            { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                        ]
                    ) {
                        name
                        allowed
                    }
                }`,
                );

                expect(result.data.data.permissions.length).toBe(1);
                expect(result.data.data.permissions[0].name).toBe(AttributeDependentValuesPermissionsActions.SET_VALUE);
                expect(result.data.data.permissions[0].allowed).toBe(true);

                // with diff targeting, should inherit (false)
                const result2 = await makeGraphQlCall(
                    `{
                    permissions(
                        type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                        applyTo: "${testAttrName}",
                        usersGroup: null,
                        actions: [${AttributeDependentValuesPermissionsActions.SET_VALUE}],
                        permissionTreeTarget: {
                            tree: "${testTreeName}", nodeId: "${treeNode3Id}"
                        },
                        dependenciesTreeTargets: [
                            { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                        ]
                    ) {
                        name
                        allowed
                    }
                }`,
                );

                expect(result2.data.data.permissions[0].allowed).toBe(null);
            });

            describe('record have node1 value', () => {
                beforeEach(async () => {
                    const resCreateRecord = await makeGraphQlCall(`mutation {
                    c1: createRecord(library: "${testLibraryName}", data: {
                        values: [{ attribute: "${testAttrName}", payload: "${treeNode1Id}"}]
                    }) { record {id} },
                }`);
                    recordId = resCreateRecord.data.data.c1.record.id;
                });

                it('should be allowed to set value node2', async () => {
                    expect(await isNonAdminAllowedToSetValueOnRecord(treeNode2Id)).toBe(true);

                    await saveRecordAttributeTestValue(treeNode2Id);
                    const values = await getRecordAttributeTestValues();
                    expect(values[0].payload.id).toBe(treeNode2Id);
                });

                it('should not be allowed to set value node3', async () => {
                    expect(await isNonAdminAllowedToSetValueOnRecord(treeNode3Id)).toBe(false);

                    await expect(saveRecordAttributeTestValue(treeNode3Id)).rejects.toThrow(/Action forbidden/);
                    const values = await getRecordAttributeTestValues();
                    expect(values[0].payload.id).toBe(treeNode1Id);
                });

                it('should not be allowed to set value null', async () => {
                    expect(await isNonAdminAllowedToSetValueOnRecord(null)).toBe(false);

                    await expect(
                        deleteRecordAttributeTestValue((await getRecordAttributeTestValues())[0].id_value),
                    ).rejects.toThrow(/Action forbidden/);
                    const values = await getRecordAttributeTestValues();
                    expect(values.length).toBe(1);
                });

                it('treeNodeChildren with dependentValuesPermissionFilter should only contain node2', async () => {
                    const treeChildren = await getTreeNodeChildrenWithDependentValuesFilter();
                    expect(treeChildren).toHaveLength(1);
                    expect(treeChildren).toEqual(expect.arrayContaining([{id: treeNode2Id}]));
                });
            });
        });
    });

    describe('another tree attribute exists', () => {
        const anotherAttrName = 'another_dependent_values_tree_attribute';
        const anotherTreeName = 'another_dependent_values_tree_attribute_attr_tree';
        let anotherTreeNodeAId: string;
        let anotherTreeNodeBId: string;

        beforeAll(async () => {
            await gqlSaveTree(anotherTreeName, 'Another Attribute tree', [testTreeLibraryName]);
            const treeNodeRecordAId = await gqlCreateRecord(testTreeLibraryName);
            const treeNodeRecordBId = await gqlCreateRecord(testTreeLibraryName);
            anotherTreeNodeAId = await gqlAddElemToTree(anotherTreeName, {
                id: treeNodeRecordAId,
                library: testTreeLibraryName,
            });
            anotherTreeNodeBId = await gqlAddElemToTree(anotherTreeName, {
                id: treeNodeRecordBId,
                library: testTreeLibraryName,
            });

            await gqlSaveAttribute({
                id: anotherAttrName,
                label: 'Dependent Attr',
                type: AttributeTypes.TREE,
                linkedTree: anotherTreeName,
                multipleValues: false,
            });

            await gqlSaveLibrary(testLibraryName, 'Test node lib', [testAttrName, anotherAttrName]);
        });

        describe('dependent on another tree attribute (allowed_by_default)', () => {
            beforeAll(async () => {
                await gqlSaveAttribute({
                    id: testAttrName,
                    label: 'Test Dependent Values Tree Attribute on another attr',
                    type: AttributeTypes.TREE,
                    linkedTree: testTreeName,
                    multipleValues: false,
                    permissions_conf_dependent_values: {
                        dependenciesTreeAttributes: [anotherAttrName],
                        allowByDefault: true,
                    },
                });
            });

            it('should save and retrieve the attribute', async () => {
                const attribute = await getAttribute(testAttrName);

                expect(attribute.permissions_conf_dependent_values.dependenciesTreeAttributes).toEqual([
                    expect.objectContaining({id: anotherAttrName}),
                ]);
            });

            describe('can not move from anotherNodeA to node2', () => {
                const setupPermission = (allowed: boolean | null) =>
                    makeGraphQlCall(
                        `mutation {
                            savePermission(
                                permission: {
                                    type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                                    applyTo: "${testAttrName}",
                                    usersGroup: null,
                                    permissionTreeTarget: {
                                        tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                                    },
                                    dependenciesTreeTargets: [
                                        { tree: "${anotherTreeName}", nodeId: "${anotherTreeNodeAId}", attributeId: "${anotherAttrName}" }
                                    ],
                                    actions: [
                                        {name: ${AttributeDependentValuesPermissionsActions.SET_VALUE}, allowed: ${allowed}},
                                    ]
                                }
                            ) { 
                                type
                            }
                        }`,
                    );

                beforeAll(async () => {
                    await setupPermission(false);
                });

                afterAll(async () => {
                    await setupPermission(null);
                });

                describe('record have anotherNodeA/node1 value', () => {
                    beforeEach(async () => {
                        const resCreateRecord = await makeGraphQlCall(`mutation {
                            c1: createRecord(library: "${testLibraryName}", data: {
                                values: [
                                    { attribute: "${anotherAttrName}", payload: "${anotherTreeNodeAId}"},
                                    { attribute: "${testAttrName}", payload: "${treeNode1Id}"}
                                ]
                            }) { record {id} },
                        }`);
                        recordId = resCreateRecord.data.data.c1.record.id;
                    });

                    it('should not be allowed to set value node2', async () => {
                        expect(await isNonAdminAllowedToSetValueOnRecord(treeNode2Id)).toBe(false);

                        await expect(saveRecordAttributeTestValue(treeNode2Id)).rejects.toThrow(/Action forbidden/);
                        const values = await getRecordAttributeTestValues();
                        expect(values[0].payload.id).toBe(treeNode1Id);
                    });

                    it('should be allowed to set value node3', async () => {
                        expect(await isNonAdminAllowedToSetValueOnRecord(treeNode3Id)).toBe(true);

                        await saveRecordAttributeTestValue(treeNode3Id);
                        const values = await getRecordAttributeTestValues();
                        expect(values[0].payload.id).toBe(treeNode3Id);
                    });

                    it('should be allowed to set value null', async () => {
                        expect(await isNonAdminAllowedToSetValueOnRecord(null)).toBe(true);

                        await deleteRecordAttributeTestValue((await getRecordAttributeTestValues())[0].id_value);
                        const values = await getRecordAttributeTestValues();
                        expect(values.length).toBe(0);
                    });
                });

                describe('record have anotherNodeB/node1 value', () => {
                    beforeEach(async () => {
                        const resCreateRecord = await makeGraphQlCall(`mutation {
                            c1: createRecord(library: "${testLibraryName}", data: {
                                values: [
                                    { attribute: "${anotherAttrName}", payload: "${anotherTreeNodeBId}"},
                                    { attribute: "${testAttrName}", payload: "${treeNode1Id}"}
                                ]
                            }) { record {id} },
                        }`);
                        recordId = resCreateRecord.data.data.c1.record.id;
                    });

                    it('should be allowed to set value node2', async () => {
                        expect(await isNonAdminAllowedToSetValueOnRecord(treeNode2Id)).toBe(true);

                        await saveRecordAttributeTestValue(treeNode2Id);
                        const values = await getRecordAttributeTestValues();
                        expect(values[0].payload.id).toBe(treeNode2Id);
                    });
                });
            });
        });

        describe('dependent on another tree attribute and itself (allowed_by_default)', () => {
            beforeAll(async () => {
                await gqlSaveAttribute({
                    id: testAttrName,
                    label: 'Test Dependent Values Tree Attribute on another attr and itself',
                    type: AttributeTypes.TREE,
                    linkedTree: testTreeName,
                    multipleValues: false,
                    permissions_conf_dependent_values: {
                        dependenciesTreeAttributes: [anotherAttrName, testAttrName],
                        allowByDefault: true,
                    },
                });
            });

            it('should save and retrieve the attribute', async () => {
                const attribute = await getAttribute(testAttrName);

                expect(attribute.permissions_conf_dependent_values.dependenciesTreeAttributes).toEqual([
                    expect.objectContaining({id: anotherAttrName}),
                    expect.objectContaining({id: testAttrName}),
                ]);
            });

            it('Inherit permission should return true by default', async () => {
                const permInheritGroup = await makeGraphQlCall(`{
                    p: inheritedPermissions(
                        type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                        applyTo: "${testAttrName}",
                        actions: [${AttributeDependentValuesPermissionsActions.SET_VALUE}],
                        permissionTreeTarget: {
                            tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                        },
                        dependenciesTreeTargets: [
                            { tree: "${anotherTreeName}", nodeId: "${anotherTreeNodeAId}", attributeId: "${anotherAttrName}" }
                            { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                        ],
                        userGroupNodeId: "${e2eNonAdminGroupId()}"
                    ) { name allowed }
                }
                `);

                expect(permInheritGroup.data.data.p[0].allowed).toBe(true);
            });

            describe('can not move from anotherNodeA/node1 to node2', () => {
                const setupPermission = (allowed: boolean | null) =>
                    makeGraphQlCall(
                        `mutation {
                    savePermission(
                        permission: {
                            type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                            applyTo: "${testAttrName}",
                            usersGroup: null,
                            permissionTreeTarget: {
                                tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                            },
                            dependenciesTreeTargets: [
                                { tree: "${anotherTreeName}", nodeId: "${anotherTreeNodeAId}", attributeId: "${anotherAttrName}" }
                                { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                            ],
                            actions: [
                                {name: ${AttributeDependentValuesPermissionsActions.SET_VALUE}, allowed: ${allowed}},
                            ]
                        }
                    ) { 
                        type
                    }
                }`,
                    );

                beforeAll(async () => {
                    await setupPermission(false);
                });

                afterAll(async () => {
                    await setupPermission(null);
                });

                it('should have setup permission to use dependent values', async () => {
                    const result = await makeGraphQlCall(
                        `{
                    permissions(
                        type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                        applyTo: "${testAttrName}",
                        usersGroup: null,
                        actions: [${AttributeDependentValuesPermissionsActions.SET_VALUE}],
                        permissionTreeTarget: {
                            tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                        },
                        dependenciesTreeTargets: [
                            { tree: "${anotherTreeName}", nodeId: "${anotherTreeNodeAId}", attributeId: "${anotherAttrName}" }
                            { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                        ]
                    ) {
                        name
                        allowed
                    }
                }`,
                    );

                    expect(result.data.data.permissions.length).toBe(1);
                    expect(result.data.data.permissions[0].name).toBe(
                        AttributeDependentValuesPermissionsActions.SET_VALUE,
                    );
                    expect(result.data.data.permissions[0].allowed).toBe(false);
                });

                it('should have setup permission to use dependent values whatever dependencies order', async () => {
                    const result = await makeGraphQlCall(
                        `{
                    permissions(
                        type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                        applyTo: "${testAttrName}",
                        usersGroup: null,
                        actions: [${AttributeDependentValuesPermissionsActions.SET_VALUE}],
                        permissionTreeTarget: {
                            tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                        },
                        dependenciesTreeTargets: [
                            { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                            { tree: "${anotherTreeName}", nodeId: "${anotherTreeNodeAId}", attributeId: "${anotherAttrName}" }
                        ]
                    ) {
                        name
                        allowed
                    }
                }`,
                    );

                    expect(result.data.data.permissions.length).toBe(1);
                    expect(result.data.data.permissions[0].name).toBe(
                        AttributeDependentValuesPermissionsActions.SET_VALUE,
                    );
                    expect(result.data.data.permissions[0].allowed).toBe(false);
                });

                describe('record have anotherNodeA/node1 value', () => {
                    beforeEach(async () => {
                        const resCreateRecord = await makeGraphQlCall(`mutation {
                            c1: createRecord(library: "${testLibraryName}", data: {
                                values: [
                                    { attribute: "${anotherAttrName}", payload: "${anotherTreeNodeAId}"},
                                    { attribute: "${testAttrName}", payload: "${treeNode1Id}"}
                                ]
                            }) { record {id} },
                        }`);
                        recordId = resCreateRecord.data.data.c1.record.id;
                    });

                    it('should not be allowed to set value node2', async () => {
                        expect(await isNonAdminAllowedToSetValueOnRecord(treeNode2Id)).toBe(false);

                        await expect(saveRecordAttributeTestValue(treeNode2Id)).rejects.toThrow(/Action forbidden/);
                        const values = await getRecordAttributeTestValues();
                        expect(values[0].payload.id).toBe(treeNode1Id);
                    });

                    it('should be allowed to set value node3', async () => {
                        expect(await isNonAdminAllowedToSetValueOnRecord(treeNode3Id)).toBe(true);

                        await saveRecordAttributeTestValue(treeNode3Id);
                        const values = await getRecordAttributeTestValues();
                        expect(values[0].payload.id).toBe(treeNode3Id);
                    });

                    it('should be allowed to set value null', async () => {
                        expect(await isNonAdminAllowedToSetValueOnRecord(null)).toBe(true);

                        await deleteRecordAttributeTestValue((await getRecordAttributeTestValues())[0].id_value);
                        const values = await getRecordAttributeTestValues();
                        expect(values.length).toBe(0);
                    });
                });
            });

            describe('can not move from anotherNodeA/null to node2', () => {
                const setupPermission = (allowed: boolean | null) =>
                    makeGraphQlCall(
                        `mutation {
                    savePermission(
                        permission: {
                            type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                            applyTo: "${testAttrName}",
                            usersGroup: null,
                            permissionTreeTarget: {
                                tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                            },
                            dependenciesTreeTargets: [
                                { tree: "${anotherTreeName}", nodeId: "${anotherTreeNodeAId}", attributeId: "${anotherAttrName}" }
                                { tree: "${testTreeName}", nodeId: null, attributeId: "${testAttrName}" }
                            ],
                            actions: [
                                {name: ${AttributeDependentValuesPermissionsActions.SET_VALUE}, allowed: ${allowed}},
                            ]
                        }
                    ) { 
                        type
                    }
                }`,
                    );

                beforeAll(async () => {
                    await setupPermission(false);
                });

                afterAll(async () => {
                    await setupPermission(null);
                });

                describe('record have anotherNodeA/null value', () => {
                    beforeEach(async () => {
                        const resCreateRecord = await makeGraphQlCall(`mutation {
                    c1: createRecord(library: "${testLibraryName}", data: {
                        values: [
                            { attribute: "${anotherAttrName}", payload: "${anotherTreeNodeAId}"},
                        ]
                    }) { record {id} },
                }`);
                        recordId = resCreateRecord.data.data.c1.record.id;
                    });

                    it('should not be allowed to set value node2', async () => {
                        expect(await isNonAdminAllowedToSetValueOnRecord(treeNode2Id)).toBe(false);

                        await expect(saveRecordAttributeTestValue(treeNode2Id)).rejects.toThrow(/Action forbidden/);
                        const values = await getRecordAttributeTestValues();
                        expect(values).toHaveLength(0);
                    });

                    it('should be allowed to set value node3', async () => {
                        expect(await isNonAdminAllowedToSetValueOnRecord(treeNode3Id)).toBe(true);

                        await saveRecordAttributeTestValue(treeNode3Id);
                        const values = await getRecordAttributeTestValues();
                        expect(values[0].payload.id).toBe(treeNode3Id);
                    });

                    it('treeNodeChildren with dependentValuesPermissionFilter should not contain node2', async () => {
                        const treeChildren = await getTreeNodeChildrenWithDependentValuesFilter();
                        expect(treeChildren).toHaveLength(2);
                        expect(treeChildren).toEqual(expect.arrayContaining([{id: treeNode1Id}, {id: treeNode3Id}]));
                    });
                });
            });

            describe('can not move from anotherNodeA/node1 to null (all tree with inheritance)', () => {
                const setupPermission = (allowed: boolean | null) =>
                    makeGraphQlCall(
                        `mutation {
                    savePermission(
                        permission: {
                            type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                            applyTo: "${testAttrName}",
                            usersGroup: null,
                            permissionTreeTarget: {
                                tree: "${testTreeName}", nodeId: null
                            },
                            dependenciesTreeTargets: [
                                { tree: "${anotherTreeName}", nodeId: "${anotherTreeNodeAId}", attributeId: "${anotherAttrName}" }
                                { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                            ],
                            actions: [
                                {name: ${AttributeDependentValuesPermissionsActions.SET_VALUE}, allowed: ${allowed}},
                            ]
                        }
                    ) { 
                        type
                    }
                }`,
                    );

                beforeAll(async () => {
                    await setupPermission(false);
                });

                afterAll(async () => {
                    await setupPermission(null);
                });

                describe('record have anotherNodeA/node1 value', () => {
                    beforeEach(async () => {
                        const resCreateRecord = await makeGraphQlCall(`mutation {
                    c1: createRecord(library: "${testLibraryName}", data: {
                        values: [
                            { attribute: "${anotherAttrName}", payload: "${anotherTreeNodeAId}"},
                            { attribute: "${testAttrName}", payload: "${treeNode1Id}"}
                        ]
                    }) { record {id} },
                }`);
                        recordId = resCreateRecord.data.data.c1.record.id;
                    });

                    it('should not be allowed to set value null', async () => {
                        expect(await isNonAdminAllowedToSetValueOnRecord(null)).toBe(false);

                        await expect(
                            deleteRecordAttributeTestValue((await getRecordAttributeTestValues())[0].id_value),
                        ).rejects.toThrow(/Action forbidden/);
                        const values = await getRecordAttributeTestValues();
                        expect(values[0].payload.id).toBe(treeNode1Id);
                    });

                    it('should be allowed to set value node2', async () => {
                        expect(await isNonAdminAllowedToSetValueOnRecord(treeNode2Id)).toBe(false); // inheritance

                        await expect(saveRecordAttributeTestValue(treeNode2Id)).rejects.toThrow(/Action forbidden/);
                        const values = await getRecordAttributeTestValues();
                        expect(values[0].payload.id).toBe(treeNode1Id);
                    });

                    it('treeNodeChildren with dependentValuesPermissionFilter should any node', async () => {
                        const treeChildren = await getTreeNodeChildrenWithDependentValuesFilter();
                        expect(treeChildren).toHaveLength(0);
                    });

                    it('Inherit permission from tree target', async () => {
                        const permInheritTreeTarget = await makeGraphQlCall(`{
                            p: inheritedPermissions(
                                type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                                applyTo: "${testAttrName}",
                                actions: [${AttributeDependentValuesPermissionsActions.SET_VALUE}],
                                permissionTreeTarget: {
                                    tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                                },
                                dependenciesTreeTargets: [
                                    { tree: "${anotherTreeName}", nodeId: "${anotherTreeNodeAId}", attributeId: "${anotherAttrName}" }
                                    { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                                ],
                                userGroupNodeId: null
                            ) { name allowed }
                        }
                        `);

                        expect(permInheritTreeTarget.data.data.p[0].allowed).toBe(false);
                    });

                    it('Inherit permission from user group', async () => {
                        const permInheritGroup = await makeGraphQlCall(`{
                            p: inheritedPermissions(
                                type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                                applyTo: "${testAttrName}",
                                actions: [${AttributeDependentValuesPermissionsActions.SET_VALUE}],
                                permissionTreeTarget: {
                                    tree: "${testTreeName}", nodeId: null
                                },
                                dependenciesTreeTargets: [
                                    { tree: "${anotherTreeName}", nodeId: "${anotherTreeNodeAId}", attributeId: "${anotherAttrName}" }
                                    { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                                ],
                                userGroupNodeId: "${e2eNonAdminGroupId()}"
                            ) { name allowed }
                        }
                        `);

                        expect(permInheritGroup.data.data.p[0].allowed).toBe(false);
                    });

                    describe('can move from anotherNodeA/node1 to node2 by overriding inherited permission', () => {
                        const setupOverridePermission = (allowed: boolean | null) =>
                            makeGraphQlCall(
                                `mutation {
                                    savePermission(
                                        permission: {
                                            type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                                            applyTo: "${testAttrName}",
                                            usersGroup: null,
                                            permissionTreeTarget: {
                                                tree: "${testTreeName}", nodeId: "${treeNode2Id}"
                                            },
                                            dependenciesTreeTargets: [
                                                { tree: "${anotherTreeName}", nodeId: "${anotherTreeNodeAId}", attributeId: "${anotherAttrName}" }
                                                { tree: "${testTreeName}", nodeId: "${treeNode1Id}", attributeId: "${testAttrName}" }
                                            ],
                                            actions: [
                                                {name: ${AttributeDependentValuesPermissionsActions.SET_VALUE}, allowed: ${allowed}},
                                            ]
                                        }
                                    ) { 
                                        type
                                    }
                                }`,
                            );

                        beforeAll(async () => {
                            await setupOverridePermission(true);
                        });

                        afterAll(async () => {
                            await setupOverridePermission(null);
                        });

                        it('should not be allowed to set value node3', async () => {
                            expect(await isNonAdminAllowedToSetValueOnRecord(null)).toBe(false);

                            await expect(saveRecordAttributeTestValue(treeNode3Id)).rejects.toThrow(/Action forbidden/);
                            const values = await getRecordAttributeTestValues();
                            expect(values[0].payload.id).toBe(treeNode1Id);
                        });

                        it('should be allowed to set value node2', async () => {
                            expect(await isNonAdminAllowedToSetValueOnRecord(treeNode2Id)).toBe(true);

                            await saveRecordAttributeTestValue(treeNode2Id);
                            const values = await getRecordAttributeTestValues();
                            expect(values[0].payload.id).toBe(treeNode2Id);
                        });

                        it('treeNodeChildren with dependentValuesPermissionFilter should contains only node2', async () => {
                            const treeChildren = await getTreeNodeChildrenWithDependentValuesFilter();
                            expect(treeChildren).toHaveLength(1);
                            expect(treeChildren).toEqual(expect.arrayContaining([{id: treeNode2Id}]));
                        });
                    });
                });
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
                        dependenciesTreeAttributes: ['unknown_attribute_id'],
                        allowByDefault: true,
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
                        dependenciesTreeAttributes: [testAttrName],
                        allowByDefault: true,
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
                        dependenciesTreeAttributes: ['test_dependent_values_tree_attribute_simple'],
                        allowByDefault: true,
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
                        dependenciesTreeAttributes: ['test_dependent_values_tree_attribute_tree_multivalue'],
                        allowByDefault: true,
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
                            dependenciesTreeAttributes {
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

    const isNonAdminAllowedToSetValueOnRecord = async (targetValue: string | null) => {
        const resIsAllowed = await makeGraphQlCall(
            `query {
                isAllowed(
                    type: ${PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES},
                    actions: [${AttributeDependentValuesPermissionsActions.SET_VALUE}],
                    applyTo: "${testAttrName}",
                    target: {
                        recordId: "${recordId}",
                        libraryId: "${testLibraryName}",
                        nodeId: ${targetValue === null ? 'null' : `"${targetValue}"`}
                    }
                ) {
                    name
                    allowed
                }
            }`,
            {
                user: e2eNonAdminUser(),
            },
        );

        return resIsAllowed.data.data.isAllowed[0].allowed;
    };

    const saveRecordAttributeTestValue = async (nodeId: string) => {
        await makeGraphQlCall(
            `mutation {
                saveValue(
                    library: "${testLibraryName}",
                    recordId: "${recordId}",
                    attribute: "${testAttrName}",
                    value: {payload: "${nodeId}"}) {
                        id_value

                        ... on TreeValue {
                            payload {
                                id
                                record {
                                    id
                                }
                            }
                        }
                    }
                }`,
            {
                user: e2eNonAdminUser(),
            },
        );
    };

    const deleteRecordAttributeTestValue = async (idValue: string) => {
        await makeGraphQlCall(
            `mutation {
                deleteValue(
                    library: "${testLibraryName}",
                    recordId: "${recordId}",
                    attribute: "${testAttrName}",
                    value: {id_value: "${idValue}"}) {
                        id_value
                    }
                }`,
            {
                user: e2eNonAdminUser(),
            },
        );
    };

    const getRecordAttributeTestValues = async (): Promise<ITreeValue[]> => {
        const resGet2 = await makeGraphQlCall(`
                {
                    records(
                        library: "${testLibraryName}",
                        filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recordId}"}]
                    ) {
                        list {
                            id
                            property(attribute: "${testAttrName}") {
                                id_value
                                ... on TreeValue {
                                    payload {
                                        id
                                        record {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `);
        return resGet2.data.data.records.list[0].property;
    };

    const getTreeNodeChildrenWithDependentValuesFilter = async (): Promise<Array<{id: string}>> => {
        const res = await makeGraphQlCall(
            `{
                treeNodeChildren(
                    treeId: "${testTreeName}",
                    dependentValuesPermissionFilter: {
                        libraryId: "${testLibraryName}",
                        attributeId: "${testAttrName}",
                        recordId: "${recordId}"
                    }
                ) {
                    list {
                        id
                    }
                }
            }`,
            {
                user: e2eNonAdminUser(),
            },
        );

        return res.data.data.treeNodeChildren.list;
    };
});
