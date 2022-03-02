// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeTypes} from '../../../../_types/attribute';
import {
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlSaveAttribute,
    gqlSaveLibrary,
    gqlSaveTree,
    makeGraphQlCall
} from '../e2eUtils';

describe('Trees', () => {
    const testTreeName = 'test_tree';
    const testTreeName2 = 'test_tree2';
    const testLibName = 'trees_library_test';
    const testLibTypeName = 'treesLibraryTest';
    const attrTreeName = 'trees_attribute_test_tree';

    test('Create Tree', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveTree(
                tree: {
                    id: "${testTreeName}",
                    label: {fr: "Test tree"},
                    libraries: [{
                        library: "users",
                        settings: {allowMultiplePositions: true, allowedAtRoot: true,  allowedChildren: ["__all__"]}
                    }]
                }
            ) {
                id
                permissions {
                    access_tree
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveTree.id).toBe(testTreeName);
        expect(res.data.data.saveTree.permissions.access_tree).toBeDefined();
        expect(res.data.errors).toBeUndefined();

        // Create another one for tests
        await gqlSaveTree(testTreeName2, 'Test tree 2', ['users_groups']);
    });

    test('Get Trees list', async () => {
        const res = await makeGraphQlCall(`{
            trees {
                list {
                    id
                    libraries {
                        library { id }
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.trees.list.length).toBeGreaterThanOrEqual(3);
        expect(res.data.errors).toBeUndefined();
    });

    test('Get Tree by ID', async () => {
        const res = await makeGraphQlCall(`{
            trees(filters: {id: "${testTreeName}"}) {
                list {
                    id
                    libraries {
                        library{ id }
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.trees.list.length).toBe(1);
        expect(res.data.data.trees.list[0].libraries).toBeDefined();
        expect(res.data.errors).toBeUndefined();
    });

    test('Get Tree by library', async () => {
        const res = await makeGraphQlCall(`{
            trees(filters: {library: "users_groups"}) {
                list {
                    id
                    libraries {
                        library { id }
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.trees.list.length).toBe(2);
        expect(res.data.data.trees.list[0].libraries[0].library.id).toBe('users_groups');
        expect(res.data.data.trees.list[1].libraries[0].library.id).toBe('users_groups');
        expect(res.data.errors).toBeUndefined();
    });

    test('Delete a tree', async () => {
        const res = await makeGraphQlCall(`mutation {deleteTree(id: "${testTreeName2}") { id }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.deleteTree).toBeDefined();
        expect(res.data.data.deleteTree.id).toBe(testTreeName2);
        expect(res.data.errors).toBeUndefined();
    });

    test('Manipulate elements in a tree', async () => {
        // Create some records
        const resCreaRecord = await makeGraphQlCall(`
                mutation {
                    r1: createRecord(library: "users") {id},
                    r2: createRecord(library: "users") {id},
                    r3: createRecord(library: "users") {id},
                    r4: createRecord(library: "users") {id},
                    r5: createRecord(library: "users") {id},
                    r6: createRecord(library: "users") {id}
                }
            `);
        const recordId1 = resCreaRecord.data.data.r1.id;
        const recordId2 = resCreaRecord.data.data.r2.id;
        const recordId3 = resCreaRecord.data.data.r3.id;
        const recordId4 = resCreaRecord.data.data.r4.id;
        const recordId5 = resCreaRecord.data.data.r5.id;
        const recordId6 = resCreaRecord.data.data.r6.id;

        // Add records to the tree
        const resAdd = await makeGraphQlCall(`mutation {
            a1: treeAddElement(
                treeId: "${testTreeName}", element: {id: "${recordId1}", library: "users"}, order: 2
            ) {id},
            a2: treeAddElement(
                treeId: "${testTreeName}", element: {id: "${recordId2}", library: "users"}, order: 1
            ) {id},
            a3: treeAddElement(
                treeId: "${testTreeName}", element: {id: "${recordId3}", library: "users"}, order: 0
            ) {id}
        }`);

        expect(resAdd.status).toBe(200);
        expect(resAdd.data.data.a1).toBeDefined();
        expect(resAdd.data.data.a1.id).toBeTruthy();
        expect(resAdd.data.errors).toBeUndefined();

        const nodeRecord1 = resAdd.data.data.a1.id;
        const nodeRecord2 = resAdd.data.data.a2.id;
        const nodeRecord3 = resAdd.data.data.a3.id;

        // test element already present in ancestors
        const nodeRecord5 = await gqlAddElemToTree(testTreeName, {id: recordId5, library: 'users'}, null, 2);
        const nodeRecord6 = await gqlAddElemToTree(testTreeName, {id: recordId6, library: 'users'}, nodeRecord5);

        const resErr = await makeGraphQlCall(`mutation {
            a1: treeAddElement(
                treeId: "${testTreeName}",
                    element: {id: "${recordId5}", library: "users"},
                    parent: "${nodeRecord6}",
                    order: 2
            ) {id}
        }`);

        expect(resErr.status).toBe(200);
        expect(resErr.data.data).toBeNull();
        expect(resErr.data.errors).toBeDefined();
        expect(resErr.data.errors[0].message).toBeDefined();
        expect(resErr.data.errors[0].extensions.fields).toBeDefined();

        await gqlAddElemToTree(testTreeName, {id: recordId4, library: 'users'}, nodeRecord1);

        // Move records inside the tree
        const resMove = await makeGraphQlCall(`mutation {
                treeMoveElement(
                    treeId: "${testTreeName}",
                    nodeId: "${nodeRecord1}",
                    parentTo: "${nodeRecord2}"
                ) {
                    id
                }
            }`);

        expect(resMove.status).toBe(200);
        expect(resMove.data.errors).toBeUndefined();
        expect(resMove.data.data.treeMoveElement).toBeDefined();
        expect(resMove.data.data.treeMoveElement.id).toBeTruthy();

        // Get tree content
        const restreeContent = await makeGraphQlCall(`
        {
            treeContent(treeId: "${testTreeName}") {
                id
                order
                childrenCount
                record {
                    id
                    library {
                        id
                    }
                }
                children {
                    id
                    record {
                        id
                        library {
                            id
                        }
                    }
                }
                permissions {
                    access_tree
                }
            }
        }
        `);

        expect(restreeContent.status).toBe(200);
        expect(restreeContent.data.data.treeContent).toBeDefined();
        expect(restreeContent.data.errors).toBeUndefined();

        expect(Array.isArray(restreeContent.data.data.treeContent)).toBe(true);
        expect(restreeContent.data.data.treeContent).toHaveLength(3);
        expect(restreeContent.data.data.treeContent[0].id).toBeTruthy();
        expect(restreeContent.data.data.treeContent[0].record.library.id).toBeTruthy();
        expect(restreeContent.data.data.treeContent[0].permissions.access_tree).toBeDefined();
        expect(restreeContent.data.data.treeContent[0].record.id).toBe(recordId3);
        expect(restreeContent.data.data.treeContent[1].record.id).toBe(recordId2);
        expect(restreeContent.data.data.treeContent[0].order).toBe(0);
        expect(restreeContent.data.data.treeContent[1].order).toBe(1);

        // Check record5 has children
        const treeContentRecord5 = restreeContent.data.data.treeContent.find(n => n.id === nodeRecord5);
        expect(treeContentRecord5.childrenCount).toBe(1);
        expect(treeContentRecord5.children).toHaveLength(1);

        // Get tree content from a specific node
        // Get tree content
        const restreeContentPartial = await makeGraphQlCall(`
        {
            treeContent(treeId: "${testTreeName}", startAt: "${nodeRecord2}") {
                id
                record {
                    id
                    library {
                        id
                    }
                }
                children {
                    id
                    record {
                        id
                        library {
                            id
                        }
                    }
                }
            }
        }
        `);

        expect(restreeContentPartial.status).toBe(200);
        expect(restreeContentPartial.data.data.treeContent).toBeDefined();
        expect(restreeContentPartial.data.data.treeContent).toHaveLength(1);
        expect(restreeContentPartial.data.errors).toBeUndefined();

        // Delete element from the tree
        const resDel = await makeGraphQlCall(`mutation {
            treeDeleteElement(
                treeId: "${testTreeName}",
                nodeId: "${nodeRecord3}"
            )
        }`);

        expect(resDel.status).toBe(200);
        expect(resDel.data.errors).toBeUndefined();
        expect(resDel.data.data.treeDeleteElement).toBeDefined();

        // Create a tree attribute
        await gqlSaveAttribute({
            id: attrTreeName,
            type: AttributeTypes.TREE,
            linkedTree: testTreeName,
            label: 'Test attr tree'
        });

        await gqlSaveLibrary(testLibName, 'Test lib', [attrTreeName]);

        // Create a record to link to the tree
        const testRecordId = await gqlCreateRecord(testLibName);

        // Save a value to the tree attribute = link record to the tree
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${testRecordId}",
                    attribute: "${attrTreeName}",
                    value: {value: "${nodeRecord1}"}) {
                        id_value

                        ... on TreeValue {
                            value {
                                id
                                record {
                                    id
                                }
                            }
                        }
                    }
                }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeTruthy();
        expect(res.data.data.saveValue.value.record.id).toBe(recordId1);

        // Get values of this attribute
        const resGetValues = await makeGraphQlCall(`{
            valElement: ${testLibTypeName} {
                list {
                    id
                    property(attribute: "${attrTreeName}") {
                        id_value
                        ... on TreeValue {
                            value {
                                id
                                record {
                                    ... on User {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
            },
            valParents: ${testLibTypeName} {
                list {
                    id
                    property(attribute: "${attrTreeName}") {
                        id_value
                        ... on TreeValue {
                            value {
                                id
                                record {
                                    id
                                },
                                ancestors {
                                    id
                                    record {
                                        ... on User {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            valChildren: ${testLibTypeName} {
                list {
                    id
                    property(attribute: "${attrTreeName}") {
                        id_value
                        ... on TreeValue {
                            value {
                                id
                                record {
                                    id
                                },
                                children {
                                    id
                                    record {
                                        ... on User {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            valLinkedRecords: ${testLibTypeName} {
                list {
                    id
                    property(attribute: "${attrTreeName}") {
                        id_value
                        ... on TreeValue {
                            value {
                                id
                                record {
                                    id
                                },
                                linkedRecords(attribute: "${attrTreeName}") {
                                    id
                                }
                            }
                        }
                    }
                }
            }
        }`);

        expect(resGetValues.status).toBe(200);
        expect(resGetValues.data.errors).toBeUndefined();
        const resData = resGetValues.data.data;

        expect(resData.valElement.list[0].property[0].id_value).toBeTruthy();
        expect(typeof resData.valElement.list[0].property[0].value).toBe('object');
        expect(resData.valElement.list[0].property[0].value.record.id).toBeTruthy();

        expect(resData.valParents.list[0].property[0].value.ancestors).toBeInstanceOf(Array);
        expect(resData.valParents.list[0].property[0].value.ancestors).toHaveLength(2);
        expect(resData.valParents.list[0].property[0].value.ancestors[0].id).toBe(nodeRecord2);
        expect(resData.valParents.list[0].property[0].value.ancestors[1].id).toBe(nodeRecord1);

        expect(resData.valChildren.list[0].property[0].value.children).toBeInstanceOf(Array);
        expect(resData.valChildren.list[0].property[0].value.children).toHaveLength(1);

        expect(resData.valLinkedRecords.list[0].property[0].value.linkedRecords).toBeInstanceOf(Array);
        expect(resData.valLinkedRecords.list[0].property[0].value.linkedRecords).toHaveLength(1);
    });
});
