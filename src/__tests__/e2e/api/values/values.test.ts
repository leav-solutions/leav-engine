import {makeGraphQlCall} from '../e2eUtils';

describe('Values', () => {
    const testLibName = 'values_library_test';
    const testLibNameType = 'valuesLibraryTest';

    const treeName = 'tree_test';
    const treeLibName = 'tree_library_test';

    const attrSimpleName = 'values_attribute_test_simple';
    const attrSimpleExtendedName = 'values_attribute_test_simple_extended';
    const attrSimpleLinkName = 'values_attribute_test_simple_link';
    const attrAdvancedName = 'values_attribute_test_adv';
    const attrAdvancedLinkName = 'values_attribute_test_adv_link';
    const attrTreeName = 'values_attribute_test_tree';

    let recordId;
    let recordIdBatch;
    let recordIdLinked;
    let advValueId;
    let treeElemId;

    beforeAll(async done => {
        // Create attributes
        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrSimpleName}",
                        type: simple,
                        format: text,
                        label: {fr: "Test attr simple"},
                        actions_list: {
                            saveValue: [
                                {id: "validateFormat",},
                                {id: "validateRegex", params: [{name: "regex", value: "^TEST"}]}
                            ]
                        }
                    }
                ) {
                    id
                }
            }`);

        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrSimpleExtendedName}",
                        type: simple,
                        format: extended,
                        label: {fr: "Test attr simple étendu"},
                        embedded_fields: [
                            {
                                format: text,
                                id: "street"
                            },
                            {
                                embedded_fields: [
                                    {
                                        format: text,
                                        id: "zipcode",
                                        validation_regex: "^[0-9]{5}$"
                                    },
                                    {
                                        format: text,
                                        id: "name"
                                    }
                                ],
                                format: extended,
                                id: "city"
                            }
                        ]
                    }
                ) {
                    id
                }
            }`);

        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrAdvancedName}",
                        type: advanced,
                        format: text,
                        label: {fr: "Test attr advanced"}
                    }
                ) { id }
            }`);

        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrSimpleLinkName}",
                        type: simple_link,
                        format: text,
                        linked_library: "${testLibName}",
                        label: {fr: "Test attr simple link"}
                    }
                ) { id }
            }`);

        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrAdvancedLinkName}",
                        type: advanced_link,
                        format: text,
                        linked_library: "${testLibName}",
                        label: {fr: "Test attr advanced link"}
                    }
                ) { id }
            }`);

        // Create library to use in tree
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${treeLibName}", label: {fr: "Test tree lib"}}) { id }
        }`);

        // create tree
        await makeGraphQlCall(`mutation {
            saveTree(
                tree: {id: "${treeName}", label: {fr: "Test tree"}, libraries: ["${treeLibName}"]}
            ) {
                id
            }
        }`);

        // Create tree attribute linking to tree
        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrTreeName}",
                    type: tree,
                    linked_tree: "${treeName}",
                    label: {fr: "Test tree attr"}
                }
            ) { id }
        }`);

        // Create library
        await makeGraphQlCall(`mutation {
                saveLibrary(library: {
                    id: "${testLibName}",
                    label: {fr: "Test lib"},
                    attributes: [
                        "id",
                        "modified_by",
                        "modified_at",
                        "created_by",
                        "created_at",
                        "${attrSimpleName}",
                        "${attrAdvancedName}",
                        "${attrSimpleLinkName}",
                        "${attrAdvancedLinkName}",
                        "${attrSimpleExtendedName}",
                        "${attrTreeName}"
                    ]
                }) { id }
            }`);

        await makeGraphQlCall('mutation { refreshSchema }');

        // Create records
        const resRecord = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${testLibName}") { id },
            c2: createRecord(library: "${testLibName}") { id },
            c3: createRecord(library: "${testLibName}") { id }
            c4: createRecord(library: "${treeLibName}") { id },
        }`);

        recordId = resRecord.data.data.c1.id;
        recordIdBatch = resRecord.data.data.c2.id;
        recordIdLinked = resRecord.data.data.c3.id;
        treeElemId = resRecord.data.data.c4.id;

        // Add element to tree
        await makeGraphQlCall(`mutation {
            treeAddElement(
                treeId: "${treeName}",
                element: {id: "${treeElemId}", library: "${treeLibName}"}
            ) {
                id
            }
        }`);

        done();
    });

    test('Save value tree', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrTreeName}",
                value: {value: "${treeLibName}/${treeElemId}"}) {
                    id_value value
                }
            }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeTruthy();
        expect(res.data.data.saveValue.value).toBe(treeLibName + '/' + treeElemId);
    });

    test('Get record filtered by tree value', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(filters: [{field: "${attrTreeName}.id", value: "${treeElemId}"}]) { list {id}} }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(1);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordId);
    });

    test('Get record sorted by tree value', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(sort: {field: "${attrTreeName}.id", order: asc}) { list {id}} }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(3);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordIdBatch);
    });

    test('Save value simple', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}",
                    value: {value: "TEST VAL"}
                ) {
                    id_value
                    value
                }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeNull();
        expect(res.data.data.saveValue.value).toBe('TEST VAL');
    });

    test('Get record filtered by simple value ', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(filters: [{field: "id", value: "${recordId}"}]) { list {id}} }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(1);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordId);
    });

    test('Get record sorted by simple value ', async () => {
        const res = await makeGraphQlCall(`{ ${testLibNameType}(sort: {field: "id", order: asc}) { list {id}} }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(3);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordId);
    });

    test("Don't save invalid value", async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}",
                    value: {value: "AAAATEST VAL"}) { id_value value }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeDefined();
        expect(res.data.errors[0].extensions.fields[attrSimpleName]).toBeDefined();
    });

    test('Save value simple extended', async () => {
        const query = `mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleExtendedName}",
                    value: {
                        value: "{\\"city\\": {\\"name\\": \\"Gre\\", \\"zipcode\\": \\"38000\\"}, \\"street\\": \\"Name\\"}"
                    }
                ) {
                    id_value
                    value
                }
            }`;

        const res = await makeGraphQlCall(query);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeNull();
        expect(res.data.data.saveValue.value).toBeTruthy();
    });

    test('Get record filtered by simple extended value', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(filters: [{field: "${attrSimpleExtendedName}.city.name", value: "Gre"}]) { list {id}} }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(1);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordId);
    });

    test('Get record sorted by simple extended value', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(sort: {field: "${attrSimpleExtendedName}.city.name", order: asc}) { list {id}} }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(3);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordIdBatch);
    });

    test("Don't save invalid simple extended", async () => {
        const query = `mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrSimpleExtendedName}",
                value: {
                    value: "{\\"city\\": {\\"name\\": \\"Gre\\", \\"zipcode\\": \\"3800\\"}, \\"street\\": \\"Name\\"}"
                }
            ) {
                id_value
                value
            }
        }`;

        const res = await makeGraphQlCall(query);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeDefined();
        expect(res.data.errors[0].extensions.fields[attrSimpleExtendedName]).toBeDefined();
    });

    test('Save value simple link', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleLinkName}",
                    value: {value: "${recordIdLinked}"}) { id_value value }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeNull();
        expect(res.data.data.saveValue.value).toBe(recordIdLinked);
    });

    test('Get record filtered by simple link value', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(filters: [{field: "${attrSimpleLinkName}.id", value: "${recordIdLinked}"}]) { list {id}} }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(1);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordId);
    });

    test('Get record sorted by simple link value', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(sort: {field: "${attrSimpleLinkName}.id", order: asc}) { list {id}} }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(3);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordIdBatch);
    });

    test('Save value advanced', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedName}",
                    value: {value: "TEST VAL ADV"}) { id_value value }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeTruthy();
        expect(res.data.data.saveValue.value).toBe('TEST VAL ADV');

        advValueId = res.data.data.saveValue.id_value;
    });

    test('Get record filtered by advanced value', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(filters: [{field: "${attrAdvancedName}", value: "TEST VAL ADV"}]) { list {id}} }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(1);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordId);
    });

    test('Get record sorted by advanced value', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(sort: {field: "${attrAdvancedName}", order: asc}) { list {id}} }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(3);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordIdBatch);
    });

    test('Save value advanced link', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedLinkName}",
                    value: {value: "${recordIdLinked}"}) { id_value value }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeTruthy();
        expect(res.data.data.saveValue.value).toBe(recordIdLinked);
    });

    test('Get record filtered by advanced link value', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(filters: [{field: "${attrAdvancedLinkName}.id", value: "${recordIdLinked}"}]) { list {id}} }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(1);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordId);
    });

    test('Get record sorted by advanced link value', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(sort: {field: "${attrAdvancedLinkName}.id", order: asc}) { list {id}} }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(3);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordIdBatch);
    });

    test('Delete value advanced', async () => {
        const res = await makeGraphQlCall(`mutation {
                deleteValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedName}",
                    value: {id_value: "${advValueId}"}) { id_value value }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.deleteValue.id_value).toBeTruthy();
    });

    test('Delete value simple', async () => {
        const res = await makeGraphQlCall(`mutation {
                deleteValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}",
                    value: {value: "TEST VAL"}) { id_value value }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
    });

    test('Save value batch', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveValueBatch(
                library: "${testLibName}",
                recordId: "${recordIdBatch}",
                values: [
                    {
                      attribute: "${attrSimpleName}",
                      value: "TEST"
                    },
                    {
                      attribute: "${attrAdvancedName}",
                      id_value: null,
                      value: "some value"
                    }
                ]
            ) {
                values {
                    id_value
                    value
                }
            }
        }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValueBatch.values).toHaveLength(2);
        expect(res.data.data.saveValueBatch.values[1].id_value).toBeTruthy();
    });
});
