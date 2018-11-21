import {makeGraphQlCall} from '../e2eUtils';

describe('Trees', () => {
    const testTreeName = 'test_tree';
    const testLibName = 'trees_library_test';
    const testLibTypeName = 'treesLibraryTest';
    const attrTreeName = 'values_attribute_test_tree';

    test('Create Tree', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveTree(
                tree: {id: "${testTreeName}", label: {fr: "Test tree"}, libraries: ["users"]}
            ) {
                id
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveTree.id).toBe(testTreeName);
        expect(res.data.errors).toBeUndefined();

        // Create another one for tests
        await makeGraphQlCall(`mutation {
            saveTree(
                tree: {id: "${testTreeName}2", label: {fr: "Test tree 2"}, libraries: ["users"]}
            ) {
                id
            }
        }`);
    });

    test('Get Trees list', async () => {
        const res = await makeGraphQlCall('{ trees { id libraries } }');

        expect(res.status).toBe(200);
        expect(res.data.data.trees.length).toBeGreaterThanOrEqual(2);
        expect(res.data.errors).toBeUndefined();
    });

    test('Get Tree by ID', async () => {
        const res = await makeGraphQlCall(`{ trees(id: "${testTreeName}") { id libraries } }`);

        expect(res.status).toBe(200);
        expect(res.data.data.trees.length).toBe(1);
        expect(res.data.data.trees[0].libraries).toBeDefined();
        expect(res.data.errors).toBeUndefined();
    });

    test('Delete a tree', async () => {
        const treeToDelete = testTreeName + '2';
        const res = await makeGraphQlCall(`mutation {deleteTree(id: "${treeToDelete}") { id }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.deleteTree).toBeDefined();
        expect(res.data.data.deleteTree.id).toBe(treeToDelete);
        expect(res.data.errors).toBeUndefined();
    });

    test('Manipulate elements in a tree', async () => {
        // Create some records
        const resCreaRecord = await makeGraphQlCall(`
                mutation {
                    r1: createRecord(library: "users") {id},
                    r2: createRecord(library: "users") {id}
                    r3: createRecord(library: "users") {id}
                    r4: createRecord(library: "users") {id}
                }
            `);
        const recordId1 = resCreaRecord.data.data.r1.id;
        const recordId2 = resCreaRecord.data.data.r2.id;
        const recordId3 = resCreaRecord.data.data.r3.id;
        const recordId4 = resCreaRecord.data.data.r4.id;

        // Add records to the tree
        const resAdd = await makeGraphQlCall(`mutation {
            a1: treeAddElement(treeId: "${testTreeName}", element: {id: "${recordId1}", library: "users"}) {id},
            a2: treeAddElement(treeId: "${testTreeName}", element: {id: "${recordId2}", library: "users"}) {id},
            a3: treeAddElement(treeId: "${testTreeName}", element: {id: "${recordId3}", library: "users"}) {id}
        }`);

        expect(resAdd.status).toBe(200);
        expect(resAdd.data.data.a1).toBeDefined();
        expect(resAdd.data.data.a1.id).toBeTruthy();
        expect(resAdd.data.errors).toBeUndefined();

        await makeGraphQlCall(`mutation {
            a4: treeAddElement(
                treeId: "${testTreeName}",
                element: {
                    id: "${recordId4}",
                    library: "users"
                },
                parent: {id: "${recordId1}", library: "users"}
            ) {id}
        }`);

        // Move records inside the tree
        const resMove = await makeGraphQlCall(`mutation {
                treeMoveElement(
                    treeId: "${testTreeName}",
                    element: {id: "${recordId1}", library: "users"}
                    parentTo: {id: "${recordId2}", library: "users"}
                ) {
                    id
                }
            }`);

        expect(resMove.status).toBe(200);
        expect(resMove.data.data.treeMoveElement).toBeDefined();
        expect(resMove.data.data.treeMoveElement.id).toBeTruthy();
        expect(resMove.data.errors).toBeUndefined();

        // Get tree content
        const restreeContent = await makeGraphQlCall(`
        {
            treeContent(treeId: "${testTreeName}") {
                record {
                    id
                    library {
                        id
                    }
                }
                children {
                    record {
                        id
                    }
                }
            }
        }
        `);

        expect(restreeContent.status).toBe(200);
        expect(restreeContent.data.data.treeContent).toBeDefined();
        expect(restreeContent.data.data.treeContent[0].record.library.id).toBeTruthy();
        expect(Array.isArray(restreeContent.data.data.treeContent)).toBe(true);
        expect(restreeContent.data.errors).toBeUndefined();

        // Delete element from the tree
        const resDel = await makeGraphQlCall(`mutation {
            treeDeleteElement(
                treeId: "${testTreeName}",
                element: {id: "${recordId3}", library: "users"}
            ) {
                id
            }
        }`);

        expect(resDel.status).toBe(200);
        expect(resDel.data.data.treeDeleteElement).toBeDefined();
        expect(resDel.data.data.treeDeleteElement.id).toBeTruthy();
        expect(resDel.data.errors).toBeUndefined();

        // Create a tree attribute
        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrTreeName}",
                    type: tree,
                    linked_tree: "${testTreeName}",
                    format: text,
                    label: {fr: "Test attr tree"}
                }
            ) { id }
        }`);

        await makeGraphQlCall(`mutation { refreshSchema }`);

        // Create library for tests
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${testLibName}",
                label: {fr: "Test lib"},
            }) { id }
        }`);

        // Add tree attribute to library
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${testLibName}",
                attributes: [
                    "id",
                    "modified_by",
                    "modified_at",
                    "created_by",
                    "created_at",
                    "${attrTreeName}"
                ]
            }) { id }
        }`);

        // Create a record to link to the tree
        const resCreaTestRecord = await makeGraphQlCall(`
                mutation {
                    r1: createRecord(library: "${testLibName}") {id}
                }
            `);

        const testRecordId = resCreaTestRecord.data.data.r1.id;

        // Save a value to the tree attribute = link record to the tree
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${testRecordId}",
                    attribute: "${attrTreeName}",
                    value: {value: "users/${recordId1}"}) { id_value value }
                }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeTruthy();
        expect(res.data.data.saveValue.value).toBe(`users/${recordId1}`);

        // Get values of this attribute
        const resGetValues = await makeGraphQlCall(`{
            valElement: ${testLibTypeName} {
                id
                ${attrTreeName} {
                    id_value
                    value {
                        record {
                            ... on User {
                                id
                            }
                        }
                    }
                }
            },
            valParents: ${testLibTypeName} {
                id
                ${attrTreeName} {
                    id_value
                    value {
                        record {
                            id
                        },
                        ancestors {
                            record {
                                ... on User {
                                    id
                                }
                            }
                        }
                    }
                }
            },
            valChildren: ${testLibTypeName} {
                id
                ${attrTreeName} {
                    id_value
                    value {
                        record {
                            id
                        },
                        children {
                            record {
                                ... on User {
                                    id
                                }
                            }
                        }
                    }
                }
            },
            valLinkedRecords: ${testLibTypeName} {
                id
                ${attrTreeName} {
                    id_value
                    value {
                        record {
                            id
                        },
                        linkedRecords(attribute: "${attrTreeName}") {
                            id
                        }
                    }
                }
            }
        }`);

        expect(resGetValues.status).toBe(200);
        expect(resGetValues.data.errors).toBeUndefined();

        expect(resGetValues.data.data.valElement[0][attrTreeName].id_value).toBeTruthy();
        expect(typeof resGetValues.data.data.valElement[0][attrTreeName].value).toBe('object');
        expect(resGetValues.data.data.valElement[0][attrTreeName].value.record.id).toBeTruthy();

        expect(resGetValues.data.data.valParents[0][attrTreeName].value.ancestors).toBeInstanceOf(Array);
        expect(resGetValues.data.data.valParents[0][attrTreeName].value.ancestors.length).toBe(2);

        expect(resGetValues.data.data.valChildren[0][attrTreeName].value.children).toBeInstanceOf(Array);
        expect(resGetValues.data.data.valChildren[0][attrTreeName].value.children.length).toBe(1);

        expect(resGetValues.data.data.valLinkedRecords[0][attrTreeName].value.linkedRecords).toBeInstanceOf(Array);
        expect(resGetValues.data.data.valLinkedRecords[0][attrTreeName].value.linkedRecords.length).toBe(1);
    });
});
