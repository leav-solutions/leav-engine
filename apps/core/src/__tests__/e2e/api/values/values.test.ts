import {CommonAttributes} from '../../../../_constants/systemAttributes';
import {AttributeCondition} from '../../../../_types/record';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {ActionsListEvents} from '../../../../_types/actionsList';
import {
    guestUserSdk,
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlGetValue,
    gqlSaveAttribute,
    gqlSaveTree,
    gqlSaveValue,
    gqlSaveValueBis,
    makeGraphQlCall,
    nonAdminUserSdk,
    adminUserSdk,
} from '../e2eUtils';
import {type ILinkValue} from '../../../../_types/value';
import {
    IMMUTABLE_CORE_SYSTEM_COMMON_ATTRIBUTE_IDS,
    IMMUTABLE_CORE_SYSTEM_FILES_ATTRIBUTE_IDS,
} from '../../../../domain/value/helpers/canSaveRecordValue';

describe('Values', () => {
    const getRecord = async (libraryId: string, recordId: string) =>
        (
            await guestUserSdk.GetRecord({
                libraryId,
                recordId,
            })
        ).records.list[0];

    const testLibName = 'values_library_test';

    const treeName = 'tree_test';
    const treeLibName = 'tree_library_test';

    const attrSimpleName = 'values_attribute_test_simple';
    const attrSimpleNameWithFormat = 'values_attribute_test_simple_with_format';
    const attrSimpleExtendedName = 'values_attribute_test_simple_extended';
    const attrSimpleLinkName = 'values_attribute_test_simple_link';
    const attrAdvancedName = 'values_attribute_test_adv';
    const attrAdvancedLinkName = 'values_attribute_test_adv_link';
    const attrAdvancedReverseLinkName = 'values_attribute_test_adv_reverse_link';
    const attrAdvancedReverseLinkToSimpleLinkName = 'values_attribute_test_adv_reverse_link_to_simple_link';
    const attrTreeName = 'values_attribute_test_tree';
    const attrDateRangeName = 'test_attr_date_range';
    const attrUniqueWithLowercaseName = 'values_attribute_test_unique_lowercase';
    const attrWithPostSaveName = 'values_attribute_test_post_save';
    const attrWithPostDeleteName = 'values_attribute_test_post_delete';

    let recordId: string;
    let recordIdBatch: string;
    let recordIdLinked: string;
    let recordIdLinked2: string;
    let recordUniqueId: string;
    let recordIdPostSaveActions: string;
    let recordIdPostDeleteActions: string;
    let advValueId: string;
    let treeElemId: string;
    let treeElemId2: string;
    let nodeTreeElem: string;
    let nodeTreeElem2: string;

    beforeAll(async () => {
        // Create attributes
        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrSimpleName}",
                        type: simple,
                        format: text,
                        unique: true,
                        label: {en: "Test attr simple"},
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

        await gqlSaveAttribute({
            id: attrSimpleNameWithFormat,
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
            label: 'Test attr simple with format',
            actionsList: {
                getValue: [{id: 'toUppercase', name: 'toUppercase'}],
            },
        });

        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrSimpleExtendedName}",
                        type: simple,
                        format: extended,
                        label: {en: "Test attr simple étendu"},
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
                        label: {en: "Test attr advanced"}
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
                        label: {en: "Test attr simple link"}
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
                        label: {en: "Test attr advanced link"}
                    }
                ) { id }
            }`);

        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrAdvancedReverseLinkName}",
                        type: advanced_link,
                        format: text,
                        linked_library: "${testLibName}",
                        label: {en: "Test attr advanced link"},
                        reverse_link: "${attrAdvancedLinkName}",
                        multiple_values: true
                    }
                ) { id }
            }`);

        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrAdvancedReverseLinkToSimpleLinkName}",
                        type: advanced_link,
                        format: text,
                        linked_library: "${testLibName}",
                        label: {en: "Test attr advanced link"},
                        reverse_link: "${attrSimpleLinkName}",
                        multiple_values: true
                    }
                ) { id }
            }`);

        await gqlSaveAttribute({
            id: attrDateRangeName,
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.DATE_RANGE,
            label: 'Test attr date range',
        });

        await gqlSaveAttribute({
            id: attrUniqueWithLowercaseName,
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
            label: 'Test attr simple unique ',
            unique: true,
            actionsList: {
                saveValue: [
                    {id: 'validateFormat', name: 'validateFormat'},
                    {id: 'toLowercase', name: 'toLowercase'},
                ],
            },
        });

        await gqlSaveAttribute({
            id: attrWithPostSaveName,
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
            label: 'Test attr with post save',
            actionsList: {
                saveValue: [{id: 'validateFormat', name: 'validateFormat'}],
                postSaveValue: [{id: 'fakeReplaceValue', name: 'fakeReplaceValue'}],
            },
        });

        await gqlSaveAttribute({
            id: attrWithPostDeleteName,
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
            label: 'Test attr with post save',
            actionsList: {
                saveValue: [{id: 'validateFormat', name: 'validateFormat'}],
                postDeleteValue: [{id: 'fakeReplaceValue', name: 'fakeReplaceValue'}],
            },
        });

        // Create library to use in tree
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${treeLibName}", label: {en: "Test tree lib"}}) { id }
        }`);

        // create tree
        await gqlSaveTree(treeName, 'Test tree', [treeLibName]);

        // Create tree attribute linking to tree
        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrTreeName}",
                    type: tree,
                    linked_tree: "${treeName}",
                    label: {en: "Test tree attr"}
                }
            ) { id }
        }`);

        // Create library
        await makeGraphQlCall(`mutation {
                saveLibrary(library: {
                    id: "${testLibName}",
                    label: {en: "Test lib"},
                    attributes: [
                        "id",
                        "modified_by",
                        "modified_at",
                        "created_by",
                        "created_at",
                        "${attrSimpleName}",
                        "${attrSimpleNameWithFormat}",
                        "${attrAdvancedName}",
                        "${attrSimpleLinkName}",
                        "${attrAdvancedLinkName}",
                        "${attrAdvancedReverseLinkName}",
                        "${attrAdvancedReverseLinkToSimpleLinkName}",
                        "${attrSimpleExtendedName}",
                        "${attrTreeName}",
                        "${attrDateRangeName}",
                        "${attrUniqueWithLowercaseName}",
                        "${attrWithPostSaveName}",
                        "${attrWithPostDeleteName}"
                    ]
                }) { id }
            }`);

        // Create records
        const resRecord = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${testLibName}") { record {id} },
            c2: createRecord(library: "${testLibName}") { record {id} },
            c3: createRecord(library: "${testLibName}") { record {id} },
            c4: createRecord(library: "${treeLibName}") { record {id} },
            c5: createRecord(library: "${testLibName}") { record {id} },
            c6: createRecord(library: "${testLibName}") { record {id} },
            c7: createRecord(library: "${testLibName}") { record {id} },
            c8: createRecord(library: "${testLibName}") { record {id} },
            c9: createRecord(library: "${treeLibName}") { record {id} }
        }`);

        recordId = resRecord.data.data.c1.record.id;
        recordIdBatch = resRecord.data.data.c2.record.id;
        recordIdLinked = resRecord.data.data.c3.record.id;
        treeElemId = resRecord.data.data.c4.record.id;
        recordUniqueId = resRecord.data.data.c5.record.id;
        recordIdPostSaveActions = resRecord.data.data.c6.record.id;
        recordIdPostDeleteActions = resRecord.data.data.c7.record.id;
        recordIdLinked2 = resRecord.data.data.c8.record.id;
        treeElemId2 = resRecord.data.data.c9.record.id;

        // Add element to tree
        nodeTreeElem = await gqlAddElemToTree(treeName, {id: treeElemId, library: treeLibName});
        nodeTreeElem2 = await gqlAddElemToTree(treeName, {id: treeElemId2, library: treeLibName});
    });

    test('Should not be able to edit common immutables attributes', async () => {
        for (const immutableAttributeId of IMMUTABLE_CORE_SYSTEM_COMMON_ATTRIBUTE_IDS) {
            await expect(
                gqlSaveValueBis(immutableAttributeId, testLibName, recordId, {payload: 'test'}),
            ).rejects.toThrow(/is an immutable core system attribute and cannot be edited/);
        }
    });

    test('Should not be able to edit files immutables attributes', async () => {
        const fileRecord = await gqlCreateRecord('files');

        for (const immutableAttributeId of IMMUTABLE_CORE_SYSTEM_FILES_ATTRIBUTE_IDS) {
            await expect(gqlSaveValueBis(immutableAttributeId, 'files', fileRecord, {payload: 'test'})).rejects.toThrow(
                /is an immutable core system attribute and cannot be edited/,
            );
        }
    });

    test('Admin user should be able to edit uuid attributes (at least temporary for users migration)', async () => {
        await adminUserSdk.SaveValue({
            attributeId: CommonAttributes.UUID,
            libraryId: testLibName,
            recordId,
            value: {payload: '3a70335f-36f7-44d1-92b7-af503e7565bf'},
        });

        const res = await adminUserSdk.GetRecordByIdStandardValuesProperty({
            libraryId: testLibName,
            recordId,
            attributeId: CommonAttributes.UUID,
        });
        console.log('res :>> ', JSON.stringify(res, null, 2));

        expect(res.records.list[0].property[0].payload).toBe('3a70335f-36f7-44d1-92b7-af503e7565bf');
    });

    test('Non admin user should not be able to edit uuid attributes', async () => {
        await expect(
            nonAdminUserSdk.SaveValue({
                attributeId: CommonAttributes.UUID,
                libraryId: testLibName,
                recordId,
                value: {payload: 'test'},
            }),
        ).rejects.toThrow(/PERMISSION_ERROR/);
    });

    test('Should not be able to edit uuid attributes with invalid value', async () => {
        await expect(
            adminUserSdk.SaveValue({
                attributeId: CommonAttributes.UUID,
                libraryId: testLibName,
                recordId,
                value: {payload: 'test'},
            }),
        ).rejects.toThrow(/error.INVALID_REGEXP: test/);
    });

    test('Save value tree', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrTreeName}",
                value: {payload: "${nodeTreeElem}"}) {
                    id_value

                    ... on TreeValue {
                        payload {
                            record {
                                id
                            }
                        }
                    }
                }
            }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeTruthy();
        expect(res.data.data.saveValue[0].payload.record.id).toBe(treeElemId);
    });

    test('Should update modified_at property of record on save tree value', async () => {
        await gqlSaveValueBis(attrTreeName, testLibName, recordId, {payload: nodeTreeElem});
        const beforeRecord = await getRecord(testLibName, recordId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1,5s to be sure modified_at would be different if updated
        await gqlSaveValueBis(attrTreeName, testLibName, recordId, {payload: nodeTreeElem2});
        const afterRecord = await getRecord(testLibName, recordId);

        expect(beforeRecord.modified_at).toBeDefined();
        expect(afterRecord.modified_at).toBeDefined();
        expect(beforeRecord.modified_at < afterRecord.modified_at).toBeTruthy();
    });

    test('Should not update value on tree link attribute if payload is the same', async () => {
        await gqlSaveValueBis(attrTreeName, testLibName, recordId, {payload: nodeTreeElem});
        const beforeRecord = await getRecord(testLibName, recordId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1,5s to be sure modified_at would be different if updated
        await gqlSaveValueBis(attrTreeName, testLibName, recordId, {payload: nodeTreeElem});
        const afterRecord = await getRecord(testLibName, recordId);

        expect(beforeRecord.modified_at).toBeDefined();
        expect(afterRecord.modified_at).toBeDefined();
        expect(beforeRecord.modified_at).toBe(afterRecord.modified_at);
    });

    test('Save value on tree monovalue attribute with no id_value should replace the current value', async () => {
        await gqlSaveValue(attrAdvancedName, testLibName, recordId, nodeTreeElem);
        const oldValue = (await gqlGetValue(testLibName, recordId, attrTreeName))[0];

        const res = await makeGraphQlCall(`mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrTreeName}",
                value: {payload: "${nodeTreeElem2}"}) {
                    id_value

                    ... on TreeValue {
                        payload {
                            record {
                                id
                            }
                        }
                    }
                }
            }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBe(oldValue.id_value);
        expect(res.data.data.saveValue[0].payload.record.id).toBe(treeElemId2);
    });

    test('Save value simple', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}",
                    value: {payload: "TEST VAL"}
                ) {
                    id_value
                    attribute {
                        permissions {
                            edit_value
                        }
                    }

                    ... on Value {
                        payload
                    }
                }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeNull();
        expect(res.data.data.saveValue[0].attribute?.permissions.edit_value).toBeDefined();
        expect(res.data.data.saveValue[0].payload).toBe('TEST VAL');
    });

    test('Should update modified_at property of record on save simple value', async () => {
        await gqlSaveValueBis(attrSimpleNameWithFormat, testLibName, recordId, {payload: 'TEST MODIFIED AT BEFORE'});
        const beforeRecord = await getRecord(testLibName, recordId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1,5s to be sure modified_at would be different if updated
        await gqlSaveValueBis(attrSimpleNameWithFormat, testLibName, recordId, {payload: 'TEST MODIFIED AT AFTER'});
        const afterRecord = await getRecord(testLibName, recordId);

        expect(beforeRecord.modified_at).toBeDefined();
        expect(afterRecord.modified_at).toBeDefined();
        expect(beforeRecord.modified_at < afterRecord.modified_at).toBeTruthy();
    });

    test('Should not update value on simple attribute if payload is the same', async () => {
        await gqlSaveValueBis(attrSimpleNameWithFormat, testLibName, recordId, {payload: 'TEST SAME VAL'});
        const beforeRecord = await getRecord(testLibName, recordId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1,5s to be sure modified_at would be different if updated
        await gqlSaveValueBis(attrSimpleNameWithFormat, testLibName, recordId, {payload: 'TEST SAME VAL'});
        const afterRecord = await getRecord(testLibName, recordId);

        expect(beforeRecord.modified_at).toBeDefined();
        expect(afterRecord.modified_at).toBeDefined();
        expect(beforeRecord.modified_at).toBe(afterRecord.modified_at);
    });

    test('Save same value on unique attribute', async () => {
        await expect(
            makeGraphQlCall(`mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordUniqueId}",
                attribute: "${attrSimpleName}",
                value: {payload: "TEST VAL"}) {
                    id_value

                    ... on Value {
                        payload
                    }
                }
          }`),
        ).rejects.toThrow(/This value has already been registered"/);
    });

    test('Save same value once prepared on unique attribute', async () => {
        await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordUniqueId}",
                    attribute: "${attrUniqueWithLowercaseName}",
                    value: {payload: "test@mail.com"}) {
                        id_value
                        ... on Value {
                            payload
                        }
                    }
            }`);

        await expect(
            makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrUniqueWithLowercaseName}",
                    value: {payload: "test@MAIL.com"}) {
                        id_value
                        ... on Value {
                            payload
                        }
                    }
            }`),
        ).rejects.toThrow(/This value has already been registered"/);
    });

    test("Don't save invalid value", async () => {
        await expect(
            makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}",
                    value: {payload: "AAAATEST VAL"}) {
                        id_value

                        ... on Value {
                            payload
                        }
                    }
              }`),
        ).rejects.toThrow(/error.INVALID_REGEXP: AAAATEST VAL/);
    });

    test('Save value simple extended', async () => {
        const query = `mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleExtendedName}",
                    value: {
                        payload: "{\\"city\\": {\\"name\\": \\"Gre\\", \\"zipcode\\": \\"38000\\"}, \\"street\\": \\"Name\\"}"
                    }
                ) {
                    id_value

                    ... on Value {
                        payload
                    }
                }
            }`;

        const res = await makeGraphQlCall(query);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeNull();
        expect(res.data.data.saveValue[0].payload).toBeTruthy();
    });

    test("Don't save invalid simple extended", async () => {
        const query = `mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrSimpleExtendedName}",
                value: {
                    payload: "{\\"city\\": {\\"name\\": \\"Gre\\", \\"zipcode\\": \\"3800\\"}, \\"street\\": \\"Name\\"}"
                }
            ) {
                id_value

                ... on Value {
                    payload
                }
            }
        }`;

        await expect(makeGraphQlCall(query)).rejects.toThrow(
            /"city.zipcode" with value "3800" fails to match the required pattern:/,
        );
    });

    test('Save value simple link', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleLinkName}",
                    value: {payload: "${recordIdLinked}"}) {
                        id_value

                        ... on LinkValue {
                            payload {
                                id
                            }
                        }
                    }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeNull();
        expect(res.data.data.saveValue[0].payload.id).toBe(recordIdLinked);
    });

    test('Should update modified_at property of record on save simple link value', async () => {
        await gqlSaveValueBis(attrSimpleLinkName, testLibName, recordId, {payload: recordIdLinked});
        const beforeRecord = await getRecord(testLibName, recordId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1,5s to be sure modified_at would be different if updated
        await gqlSaveValueBis(attrSimpleLinkName, testLibName, recordId, {payload: recordIdLinked2});
        const afterRecord = await getRecord(testLibName, recordId);

        expect(beforeRecord.modified_at).toBeDefined();
        expect(afterRecord.modified_at).toBeDefined();
        expect(beforeRecord.modified_at < afterRecord.modified_at).toBeTruthy();
    });

    test('Should not update value on simple link attribute if payload is the same', async () => {
        await gqlSaveValueBis(attrSimpleLinkName, testLibName, recordId, {payload: recordIdLinked});
        const beforeRecord = await getRecord(testLibName, recordId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1,5s to be sure modified_at would be different if updated
        await gqlSaveValueBis(attrSimpleLinkName, testLibName, recordId, {payload: recordIdLinked});
        const afterRecord = await getRecord(testLibName, recordId);

        expect(beforeRecord.modified_at).toBeDefined();
        expect(afterRecord.modified_at).toBeDefined();
        expect(beforeRecord.modified_at).toBe(afterRecord.modified_at);
    });

    test('Save value advanced', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedName}",
                    value: {payload: "TEST VAL ADV"}) {
                        id_value

                        ... on Value {
                            payload
                        }
                    }
              }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeTruthy();
        expect(res.data.data.saveValue[0].payload).toBe('TEST VAL ADV');

        advValueId = res.data.data.saveValue[0].id_value;
    });

    test('Should update modified_at property of record on save advanced value', async () => {
        await gqlSaveValueBis(attrAdvancedName, testLibName, recordId, {payload: 'TEST MODIFIED AT BEFORE'});
        const beforeRecord = await getRecord(testLibName, recordId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1,5s to be sure modified_at would be different if updated
        await gqlSaveValueBis(attrAdvancedName, testLibName, recordId, {payload: 'TEST MODIFIED AT AFTER'});
        const afterRecord = await getRecord(testLibName, recordId);

        expect(beforeRecord.modified_at).toBeDefined();
        expect(afterRecord.modified_at).toBeDefined();
        expect(beforeRecord.modified_at < afterRecord.modified_at).toBeTruthy();
    });

    test('Should not update value on advanced attribute if payload is the same', async () => {
        const idValue = await gqlSaveValueBis(attrAdvancedName, testLibName, recordId, {payload: 'TEST VAL ADV'});
        const beforeRecord = await getRecord(testLibName, recordId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1,5s to be sure modified_at would be different if updated
        await gqlSaveValueBis(attrAdvancedName, testLibName, recordId, {payload: 'TEST VAL ADV', id_value: idValue});
        const afterRecord = await getRecord(testLibName, recordId);

        expect(beforeRecord.modified_at).toBeDefined();
        expect(afterRecord.modified_at).toBeDefined();
        expect(beforeRecord.modified_at).toBe(afterRecord.modified_at);
    });

    test('Save value on advanced monovalue attribute with no id_value should replace the current value', async () => {
        await gqlSaveValue(attrAdvancedName, testLibName, recordId, 'test value');
        const oldValue = (await gqlGetValue(testLibName, recordId, attrAdvancedName))[0];

        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedName}",
                    value: {payload: "new value"}) {
                        id_value
                        ... on Value {
                            payload
                        }
                    }
              }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].payload).toBe('new value');
        expect(res.data.data.saveValue[0].id_value).toBe(oldValue.id_value);

        advValueId = res.data.data.saveValue[0].id_value;
    });

    test('Save value advanced link', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedLinkName}",
                    value: {payload: "${recordIdLinked}"}) {
                        id_value

                        ... on LinkValue {
                            payload {
                                id
                            }
                        }
                    }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeTruthy();
        expect(res.data.data.saveValue[0].payload.id).toBe(recordIdLinked);
    });

    test('Should update modified_at property of record on save advanced link value', async () => {
        await gqlSaveValueBis(attrAdvancedLinkName, testLibName, recordId, {payload: recordIdLinked});
        const beforeRecord = await getRecord(testLibName, recordId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1,5s to be sure modified_at would be different if updated
        await gqlSaveValueBis(attrAdvancedLinkName, testLibName, recordId, {payload: recordIdLinked2});
        const afterRecord = await getRecord(testLibName, recordId);

        expect(beforeRecord.modified_at).toBeDefined();
        expect(afterRecord.modified_at).toBeDefined();
        expect(beforeRecord.modified_at < afterRecord.modified_at).toBeTruthy();
    });

    test('Should not update value on advanced link attribute if payload is the same', async () => {
        await gqlSaveValueBis(attrAdvancedLinkName, testLibName, recordId, {payload: recordIdLinked});
        const beforeRecord = await getRecord(testLibName, recordId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1,5s to be sure modified_at would be different if updated
        await gqlSaveValueBis(attrAdvancedLinkName, testLibName, recordId, {payload: recordIdLinked});
        const afterRecord = await getRecord(testLibName, recordId);

        expect(beforeRecord.modified_at).toBeDefined();
        expect(afterRecord.modified_at).toBeDefined();
        expect(beforeRecord.modified_at).toBe(afterRecord.modified_at);
    });

    test('Save value on advanced link monovalue attribute with no id_value should replace the current value', async () => {
        await gqlSaveValue(attrAdvancedLinkName, testLibName, recordId, recordIdLinked);
        const oldValue = (await gqlGetValue(testLibName, recordId, attrAdvancedLinkName))[0];

        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedLinkName}",
                    value: {payload: "${recordIdLinked2}"}) {
                        id_value
                        ... on LinkValue {
                            payload {
                                id
                            }
                        }
                    }
              }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].payload.id).toBe(recordIdLinked2);
        expect(res.data.data.saveValue[0].id_value).toBe(oldValue.id_value);
    });

    test('Delete value advanced', async () => {
        const res = await makeGraphQlCall(`mutation {
                deleteValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedName}",
                    value: { id_value: "${advValueId}"}) { id_value }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.deleteValue[0].id_value).toBeTruthy();
    });

    test('Delete value simple', async () => {
        await makeGraphQlCall(`mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrSimpleName}",
                value: {payload: "TEST VAL"}) { id_value }
          }`);

        const res = await makeGraphQlCall(`mutation {
                deleteValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}") { 
                        id_value,
                        ... on Value {
                            payload
                        } 
                    }
              }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.deleteValue).toEqual([{id_value: null, payload: 'TEST VAL'}]);
    });

    test('Delete a value that never existed on a simple attribute does not throw (payload null)', async () => {
        const {createRecord} = await adminUserSdk.CreateRecord({library: testLibName});
        const freshRecordId = createRecord.record.id;

        const res = await adminUserSdk.DeleteValue({
            library: testLibName,
            recordId: freshRecordId,
            attribute: attrSimpleName,
            value: {payload: null},
        });

        // No value was ever set on this fresh record for this attribute: nothing to delete, no error.
        expect(res.deleteValue).toEqual([]);
    });

    test('Delete value on simple link attribute', async () => {
        await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleLinkName}",
                    value: {payload: "${recordIdLinked}"}) { id_value }
              }`);

        const res = await makeGraphQlCall(`mutation {
                deleteValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleLinkName}") { 
                        ... on LinkValue {
                            payload {
                                id
                            }
                        }
                    }
              }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.deleteValue).toEqual([{payload: {id: recordIdLinked}}]);
    });

    test('Delete value on tree attribute', async () => {
        const saveValueRes = await makeGraphQlCall(`mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrTreeName}",
                value: {payload: "${nodeTreeElem}"}) {
                    id_value
                }
            }`);

        const idValue = saveValueRes.data.data.saveValue[0].id_value;

        const res = await makeGraphQlCall(`mutation {
                deleteValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrTreeName}",
                    value: { id_value: "${idValue}"}) { id_value }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.deleteValue[0].id_value).toBeTruthy();
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

                    ... on Value {
                        payload
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValueBatch.values).toHaveLength(2);
        expect(res.data.data.saveValueBatch.values[1].id_value).toBeTruthy();
    });

    describe('Advanced reverse link from advanced link', () => {
        let recordIdAdvancedLink: string;
        let recordIdReverseLink: string;

        beforeEach(async () => {
            recordIdAdvancedLink = await gqlCreateRecord(testLibName);
            recordIdReverseLink = await gqlCreateRecord(testLibName);
        });

        test('Save reverse value should create advanced link in linked record', async () => {
            const res = await makeGraphQlCall(`mutation {
                    saveValue(
                        library: "${testLibName}",
                        recordId: "${recordIdReverseLink}",
                        attribute: "${attrAdvancedReverseLinkName}",
                        value: {payload: "${recordIdAdvancedLink}"}) {
                            id_value

                            ... on LinkValue {
                                payload {
                                    id
                                }
                            }
                        }
                }`);

            expect(res.status).toBe(200);

            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.saveValue[0].id_value).toBeTruthy();
            expect(res.data.data.saveValue[0].payload.id).toBe(recordIdAdvancedLink);

            const advLinkValue = await getAdvancedLinkFromRecord(recordIdAdvancedLink);
            expect(advLinkValue[0].id_value).toBe(res.data.data.saveValue[0].id_value);
            expect(advLinkValue[0].payload.id).toBe(recordIdReverseLink);
        });

        test('Save advanced value to linked record should add reverse link', async () => {
            const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordIdAdvancedLink}",
                    attribute: "${attrAdvancedLinkName}",
                    value: {payload: "${recordIdReverseLink}"}) {
                        id_value
                        ... on LinkValue {
                            payload {
                                id
                            }
                        }
                    }
                }`);

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.saveValue[0].id_value).toBeTruthy();
            expect(res.data.data.saveValue[0].payload.id).toBe(recordIdReverseLink);

            const reverseLinkValues = await getReverseLinkFromRecord(recordIdReverseLink);
            expect(reverseLinkValues[0].id_value).toBe(res.data.data.saveValue[0].id_value);
            expect(reverseLinkValues[0].payload.id).toBe(recordIdAdvancedLink);
        });

        describe('Record have existing reverse link', () => {
            let advancedReverseLinkValueId: string;
            beforeEach(async () => {
                const res = await makeGraphQlCall(`mutation {
                    saveValueBatch(
                        library: "${testLibName}",
                        recordId: "${recordIdReverseLink}",
                        values: [
                            {
                                attribute: "${attrAdvancedReverseLinkName}",
                                id_value: null,
                                payload: "${recordIdAdvancedLink}"
                            },
                        ]
                    ) {
                        values {
                            id_value

                            ... on LinkValue {
                                payload {
                                    id
                                }
                            }
                        }
                    }
                }`);

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                advancedReverseLinkValueId = res.data.data.saveValueBatch.values[0].id_value;
            });

            test('Save reverse value should add advanced link in linked record', async () => {
                const recordIdAdvancedLinkBis = await gqlCreateRecord(testLibName);
                const res = await makeGraphQlCall(`mutation {
                    saveValue(
                        library: "${testLibName}",
                        recordId: "${recordIdReverseLink}",
                        attribute: "${attrAdvancedReverseLinkName}",
                        value: {payload: "${recordIdAdvancedLinkBis}"}) {
                            id_value
                            ... on LinkValue {
                                payload {
                                    id
                                }
                            }
                        }
                }`);

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.saveValue[0].id_value).toBeTruthy();
                expect(res.data.data.saveValue[0].payload.id).toBe(recordIdAdvancedLinkBis);

                const advancedLinkValueBis = await getAdvancedLinkFromRecord(recordIdAdvancedLinkBis);
                expect(advancedLinkValueBis[0].id_value).toBeTruthy();
                expect(advancedLinkValueBis[0].payload.id).toBe(recordIdReverseLink);

                const advancedLinkValue = await getAdvancedLinkFromRecord(recordIdAdvancedLink);
                expect(advancedLinkValue[0].id_value).toBeTruthy();
                expect(advancedLinkValue[0].payload.id).toBe(recordIdReverseLink);

                const reverseLinkValues = await getReverseLinkFromRecord(recordIdReverseLink);
                expect(reverseLinkValues).toHaveLength(2);
                expect(reverseLinkValues.map(v => v.id_value)).toEqual(
                    expect.arrayContaining([advancedLinkValue[0].id_value, advancedLinkValueBis[0].id_value]),
                );
                expect(reverseLinkValues.map(v => v.payload.id)).toEqual(
                    expect.arrayContaining([recordIdAdvancedLink, recordIdAdvancedLinkBis]),
                );
            });

            test('Delete value should remove advanced link from linked record', async () => {
                const res = await makeGraphQlCall(`mutation {
                    deleteValue(
                        library: "${testLibName}",
                        recordId: "${recordIdReverseLink}",
                        attribute: "${attrAdvancedReverseLinkName}",
                        value: {id_value: "${advancedReverseLinkValueId}"}) {
                            id_value
                            ... on LinkValue {
                                payload {
                                    id
                                }
                            }
                        }
                    }`);

                expect(res.status).toBe(200);

                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.deleteValue[0].id_value).toBe(advancedReverseLinkValueId);
                expect(res.data.data.deleteValue[0].payload.id).toBe(recordIdAdvancedLink);

                expect(await getAdvancedLinkFromRecord(recordIdAdvancedLink)).toHaveLength(0);
            });

            test('Delete value with saveValueBatch should remove advanced link from linked record', async () => {
                const res = await makeGraphQlCall(`mutation {
                    saveValueBatch(
                            library: "${testLibName}",
                            recordId: "${recordIdReverseLink}",
                            deleteEmpty: true,
                            values: [
                                {
                                    attribute: "${attrAdvancedReverseLinkName}",
                                    id_value: "${advancedReverseLinkValueId}",
                                },
                            ]
                        ) {
                            values {
                                id_value
                                ... on LinkValue {
                                    payload {
                                        id
                                    }
                                }
                            }
                        }
                    }`);

                expect(res.status).toBe(200);

                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.saveValueBatch.values).toHaveLength(1);
                expect(res.data.data.saveValueBatch.values[0].id_value).toBe(advancedReverseLinkValueId);
                expect(res.data.data.saveValueBatch.values[0].payload.id).toBe(recordIdAdvancedLink);

                expect(await getAdvancedLinkFromRecord(recordIdAdvancedLink)).toHaveLength(0);
            });
        });

        async function getAdvancedLinkFromRecord(recId: string): Promise<ILinkValue[]> {
            const resLinkedRecord = await makeGraphQlCall(`query {
                    records(
                        library: "${testLibName}",
                        filters: [ { field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recId}" }]
                    ) {
                        list {
                            property (attribute: "${attrAdvancedLinkName}") {
                                id_value
                                ... on LinkValue {
                                    payload {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }`);

            expect(resLinkedRecord.status).toBe(200);
            expect(resLinkedRecord.data.errors).toBeUndefined();

            return resLinkedRecord.data.data.records.list[0].property;
        }

        async function getReverseLinkFromRecord(recId: string): Promise<ILinkValue[]> {
            const resRecord = await makeGraphQlCall(`query {
                    records(
                        library: "${testLibName}",
                        filters: [ { field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recId}" }]
                    ) {
                        list {
                            property (attribute: "${attrAdvancedReverseLinkName}") {
                                id_value
                                ... on LinkValue {
                                    payload {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }`);

            expect(resRecord.status).toBe(200);
            expect(resRecord.data.errors).toBeUndefined();

            return resRecord.data.data.records.list[0].property;
        }
    });

    describe('Advanced reverse link from simple link', () => {
        let recordIdSimpleLink: string;
        let recordIdReverseLink: string;

        beforeEach(async () => {
            recordIdSimpleLink = await gqlCreateRecord(testLibName);
            recordIdReverseLink = await gqlCreateRecord(testLibName);
        });

        test('Save reverse value should create simple link in linked record', async () => {
            const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordIdReverseLink}",
                    attribute: "${attrAdvancedReverseLinkToSimpleLinkName}",
                    value: {payload: "${recordIdSimpleLink}"}) {
                        id_value
                        ... on LinkValue {
                            payload {
                                id
                            }
                        }
                    }
            }`);

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.saveValue[0].id_value).toBe(recordIdSimpleLink);
            expect(res.data.data.saveValue[0].payload.id).toBe(recordIdSimpleLink);

            const simpleLinkValue = await getSimpleLinkLinkedRecord(recordIdSimpleLink);
            expect(simpleLinkValue.id_value).toBeFalsy(); // simple link
            expect(simpleLinkValue.payload.id).toBe(recordIdReverseLink);
        });

        test('Save simple value to linked record should add reverse link', async () => {
            const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordIdSimpleLink}",
                    attribute: "${attrSimpleLinkName}",
                    value: {payload: "${recordIdReverseLink}"}) {
                        id_value
                        ... on LinkValue {
                            payload {
                                id
                            }
                        }
                    }
                }`);

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.saveValue[0].id_value).toBeFalsy(); // simple link
            expect(res.data.data.saveValue[0].payload.id).toBe(recordIdReverseLink);

            const reverseLinkValues = await getReverseLinkFromRecord(recordIdReverseLink);
            expect(reverseLinkValues[0].id_value).toBe(recordIdSimpleLink);
            expect(reverseLinkValues[0].payload.id).toBe(recordIdSimpleLink);
        });

        describe('Record have existing reverse link', () => {
            let advancedReverseSimpleLinkValueId: string;
            beforeEach(async () => {
                const res = await makeGraphQlCall(`mutation {
                    saveValueBatch(
                        library: "${testLibName}",
                        recordId: "${recordIdReverseLink}",
                        values: [
                            {
                                attribute: "${attrAdvancedReverseLinkToSimpleLinkName}",
                                id_value: null,
                                payload: "${recordIdSimpleLink}"
                            },
                        ]
                    ) {
                        values {
                            id_value

                            ... on LinkValue {
                                payload {
                                    id
                                }
                            }
                        }
                    }
                }`);

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                advancedReverseSimpleLinkValueId = res.data.data.saveValueBatch.values[0].id_value;
                expect(advancedReverseSimpleLinkValueId).toBe(recordIdSimpleLink);
            });

            test('Save reverse value should add simple link in linked record', async () => {
                const recordIdSimpleLinkBis = await gqlCreateRecord(testLibName);
                const res = await makeGraphQlCall(`mutation {
                    saveValue(
                        library: "${testLibName}",
                        recordId: "${recordIdReverseLink}",
                        attribute: "${attrAdvancedReverseLinkToSimpleLinkName}",
                        value: {payload: "${recordIdSimpleLinkBis}"}) {
                            id_value
                            ... on LinkValue {
                                payload {
                                    id
                                }
                            }
                        }
                }`);

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.saveValue[0].id_value).toBe(recordIdSimpleLinkBis);
                expect(res.data.data.saveValue[0].payload.id).toBe(recordIdSimpleLinkBis);

                const simpleLinkValueBis = await getSimpleLinkLinkedRecord(recordIdSimpleLinkBis);
                expect(simpleLinkValueBis.id_value).toBeFalsy(); // simple link
                expect(simpleLinkValueBis.payload.id).toBe(recordIdReverseLink);

                const simpleLinkValue = await getSimpleLinkLinkedRecord(recordIdSimpleLink);
                expect(simpleLinkValue.id_value).toBeFalsy(); // simple link
                expect(simpleLinkValue.payload.id).toBe(recordIdReverseLink);

                const reverseLinkValues = await getReverseLinkFromRecord(recordIdReverseLink);
                expect(reverseLinkValues).toHaveLength(2);
                expect(reverseLinkValues.map(v => v.id_value)).toEqual(
                    expect.arrayContaining([recordIdSimpleLink, recordIdSimpleLinkBis]),
                );
                expect(reverseLinkValues.map(v => v.payload.id)).toEqual(
                    expect.arrayContaining([recordIdSimpleLink, recordIdSimpleLinkBis]),
                );
            });

            test('Delete value should remove simple link from linked record and deactivate linked record', async () => {
                const res = await makeGraphQlCall(`mutation {
                    deleteValue(
                        library: "${testLibName}",
                        recordId: "${recordIdReverseLink}",
                        attribute: "${attrAdvancedReverseLinkToSimpleLinkName}",
                        value: {id_value: "${advancedReverseSimpleLinkValueId}"}) {
                            id_value
                            ... on LinkValue {
                                payload {
                                    id
                                }
                            }
                        }
                    }`);

                expect(res.status).toBe(200);

                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.deleteValue[0].id_value).toBe(advancedReverseSimpleLinkValueId);
                expect(res.data.data.deleteValue[0].payload.id).toBe(recordIdSimpleLink);

                expect(await getSimpleLinkLinkedRecord(recordIdSimpleLink, true)).toBeUndefined();
                expect(await getReverseLinkFromRecord(recordIdReverseLink)).toHaveLength(0);
            });

            test('Delete value with saveValueBatch should remove simple link from linked record and deactivate linked record', async () => {
                const res = await makeGraphQlCall(`mutation {
                    saveValueBatch(
                            library: "${testLibName}",
                            recordId: "${recordIdReverseLink}",
                            deleteEmpty: true,
                            values: [
                                {
                                    attribute: "${attrAdvancedReverseLinkToSimpleLinkName}",
                                    id_value: "${advancedReverseSimpleLinkValueId}",
                                },
                            ]
                        ) {
                            values {
                                id_value
                                ... on LinkValue {
                                    payload {
                                        id
                                    }
                                }
                            }
                        }
                    }`);

                expect(res.status).toBe(200);

                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.saveValueBatch.values).toHaveLength(1);
                expect(res.data.data.saveValueBatch.values[0].id_value).toBe(advancedReverseSimpleLinkValueId);
                expect(res.data.data.saveValueBatch.values[0].payload.id).toBe(recordIdSimpleLink);

                expect(await getSimpleLinkLinkedRecord(recordIdSimpleLink, true)).toBeUndefined();
                expect(await getReverseLinkFromRecord(recordIdReverseLink)).toHaveLength(0);
            });
        });

        async function getSimpleLinkLinkedRecord(
            recId: string,
            expectInactive = false,
        ): Promise<ILinkValue | undefined> {
            const resLinkedRecord = await makeGraphQlCall(`query {
                    records(
                        library: "${testLibName}",
                        filters: [ { field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recId}" }],
                        retrieveInactive: ${expectInactive}
                    ) {
                        list {
                            active
                            property (attribute: "${attrSimpleLinkName}") {
                                id_value
                                ... on LinkValue {
                                    payload {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }`);

            expect(resLinkedRecord.status).toBe(200);
            expect(resLinkedRecord.data.errors).toBeUndefined();
            expect(resLinkedRecord.data.data.records.list[0].active).toBe(!expectInactive);

            return resLinkedRecord.data.data.records.list[0].property[0];
        }

        async function getReverseLinkFromRecord(recId: string): Promise<ILinkValue[]> {
            const resRecord = await makeGraphQlCall(`query {
                    records(
                        library: "${testLibName}",
                        filters: [ { field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recId}" }]
                    ) {
                        list {
                            property (attribute: "${attrAdvancedReverseLinkToSimpleLinkName}") {
                                id_value
                                ... on LinkValue {
                                    payload {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }`);

            expect(resRecord.status).toBe(200);
            expect(resRecord.data.errors).toBeUndefined();

            return resRecord.data.data.records.list[0].property;
        }
    });

    describe('Date range attribute', () => {
        test('Save and get date range value', async () => {
            const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrDateRangeName}",
                    value: {
                        payload: "{\\"from\\": 1000, \\"to\\": 2000}"
                    }
                ) {
                    id_value

                    ... on Value {
                        payload
                    }
                }
              }`);

            expect(res.status).toBe(200);

            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.saveValue[0].payload).toEqual({
                from: 1000,
                to: 2000,
            });
        });

        test("Don't save value if invalid (from > to)", async () => {
            await expect(
                makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrDateRangeName}",
                    value: {
                        payload: "{\\"from\\": 2000, \\"to\\": 1000}"
                    }
                ) {
                    id_value

                    ... on Value {
                        payload
                    }
                }
              }`),
            ).rejects.toThrow(/error.INVALID_DATE_RANGE/);
        });
    });

    describe('Post save value actions', () => {
        test('Post save value actions run on save value', async () => {
            const saveValueRes = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordIdPostSaveActions}",
                    attribute: "${attrWithPostSaveName}",
                    value: {payload: "test value"}
                ) {
                    id_value
                    ... on Value {
                        payload
                    }
                }
            }`);

            expect(saveValueRes.status).toBe(200);
            expect(saveValueRes.data.errors).toBeUndefined();

            const values = await gqlGetValue(testLibName, recordIdPostSaveActions, attrWithPostSaveName);

            expect(values).toEqual([
                {
                    id_value: null,
                    valuePayload: `This value has been replaced by the fakeplugin on ${ActionsListEvents.POST_SAVE_VALUE}`,
                },
            ]);
        });

        test('Post save value actions run on save value batch', async () => {
            const saveValueBatchRes = await makeGraphQlCall(`mutation {
                saveValueBatch(
                    library: "${testLibName}",
                    recordId: "${recordIdPostSaveActions}",
                    values: [
                        {attribute: "${attrWithPostSaveName}", value: "batch test 1"},
                        {attribute: "${attrWithPostSaveName}", value: "batch test 2"}
                    ]
                ) {
                    values {
                        ... on Value {
                            payload
                        }
                    }
                }
            }`);

            expect(saveValueBatchRes.status).toBe(200);
            expect(saveValueBatchRes.data.errors).toBeUndefined();

            const values = await gqlGetValue(testLibName, recordIdPostSaveActions, attrWithPostSaveName);

            expect(values).toEqual([
                {
                    id_value: null,
                    valuePayload: `This value has been replaced by the fakeplugin on ${ActionsListEvents.POST_SAVE_VALUE}`,
                },
            ]);
        });
    });

    describe('Post delete value actions', () => {
        test('Post delete value actions run on delete value', async () => {
            const saveValueRes = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrWithPostDeleteName}",
                    value: {payload: "test"}) { id_value }
            }`);

            expect(saveValueRes.status).toBe(200);
            expect(saveValueRes.data.errors).toBeUndefined();

            const deleteValueRes = await makeGraphQlCall(`mutation {
                 deleteValue(
                        library: "${testLibName}",
                        recordId: "${recordId}",
                        attribute: "${attrWithPostDeleteName}") { id_value }

            }`);

            expect(deleteValueRes.status).toBe(200);
            expect(deleteValueRes.data.errors).toBeUndefined();

            const values = await gqlGetValue(testLibName, recordId, attrWithPostDeleteName);

            expect(values).toEqual([
                {
                    id_value: null,
                    valuePayload: `This value has been replaced by the fakeplugin on ${ActionsListEvents.POST_DELETE_VALUE}`,
                },
            ]);
        });
    });
});
