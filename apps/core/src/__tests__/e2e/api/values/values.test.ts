// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {gqlAddElemToTree, gqlSaveAttribute, gqlSaveTree, makeGraphQlCall} from '../e2eUtils';

describe('Values', () => {
    const testLibName = 'values_library_test';

    const treeName = 'tree_test';
    const treeLibName = 'tree_library_test';

    const attrSimpleName = 'values_attribute_test_simple';
    const attrSimpleExtendedName = 'values_attribute_test_simple_extended';
    const attrSimpleLinkName = 'values_attribute_test_simple_link';
    const attrAdvancedName = 'values_attribute_test_adv';
    const attrAdvancedLinkName = 'values_attribute_test_adv_link';
    const attrAdvancedReverseLinkName = 'values_attribute_test_adv_reverse_link';
    const attrAdvancedReverseLinkToSimpleLinkName = 'values_attribute_test_adv_reverse_link_to_simple_link';
    const attrTreeName = 'values_attribute_test_tree';
    const attrDateRangeName = 'test_attr_date_range';

    let recordId: string;
    let recordIdBatch: string;
    let recordIdLinked: string;
    let recordUniqueId: string;
    let advValueId: string;
    let treeElemId: string;
    let nodeTreeElem: string;

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
                        reverse_link: "${attrAdvancedLinkName}"
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
                        reverse_link: "${attrSimpleLinkName}"
                    }
                ) { id }
            }`);

        await gqlSaveAttribute({
            id: attrDateRangeName,
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.DATE_RANGE,
            label: 'Test attr date range'
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
                        "${attrAdvancedName}",
                        "${attrSimpleLinkName}",
                        "${attrAdvancedLinkName}",
                        "${attrAdvancedReverseLinkName}",
                        "${attrAdvancedReverseLinkToSimpleLinkName}",
                        "${attrSimpleExtendedName}",
                        "${attrTreeName}",
                        "${attrDateRangeName}"
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
        }`);

        recordId = resRecord.data.data.c1.record.id;
        recordIdBatch = resRecord.data.data.c2.record.id;
        recordIdLinked = resRecord.data.data.c3.record.id;
        treeElemId = resRecord.data.data.c4.record.id;
        recordUniqueId = resRecord.data.data.c5.record.id;

        // Add element to tree
        nodeTreeElem = await gqlAddElemToTree(treeName, {id: treeElemId, library: treeLibName});
    });

    test('Save value tree', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrTreeName}",
                value: {value: "${nodeTreeElem}"}) {
                    id_value

                    ... on TreeValue {
                        value {
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
        expect(res.data.data.saveValue[0].value.record.id).toBe(treeElemId);
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
                    attribute {
                        permissions {
                            edit_value
                        }
                    }

                    ... on Value {
                        value
                    }
                }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeNull();
        expect(res.data.data.saveValue[0].attribute?.permissions.edit_value).toBeDefined();
        expect(res.data.data.saveValue[0].value).toBe('TEST VAL');
    });

    test('Save same value on unique attribute', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordUniqueId}",
                attribute: "${attrSimpleName}",
                value: {value: "TEST VAL"}) {
                    id_value

                    ... on Value {
                        value
                    }
                }
          }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeDefined();
        expect(res.data.errors[0].extensions.fields[attrSimpleName]).toBeDefined();
    });

    test("Don't save invalid value", async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}",
                    value: {value: "AAAATEST VAL"}) {
                        id_value

                        ... on Value {
                            value
                        }
                    }
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

                    ... on Value {
                        value
                    }
                }
            }`;

        const res = await makeGraphQlCall(query);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeNull();
        expect(res.data.data.saveValue[0].value).toBeTruthy();
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

                ... on Value {
                    value
                }
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
                    value: {value: "${recordIdLinked}"}) {
                        id_value

                        ... on LinkValue {
                            value {
                                id
                            }
                        }
                    }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeNull();
        expect(res.data.data.saveValue[0].value.id).toBe(recordIdLinked);
    });

    test('Save value advanced', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedName}",
                    value: {value: "TEST VAL ADV"}) {
                        id_value

                        ... on Value {
                            value
                        }
                    }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeTruthy();
        expect(res.data.data.saveValue[0].value).toBe('TEST VAL ADV');

        advValueId = res.data.data.saveValue[0].id_value;
    });

    test('Save value advanced link', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedLinkName}",
                    value: {value: "${recordIdLinked}"}) {
                        id_value

                        ... on LinkValue {
                            value {
                                id
                            }
                        }
                    }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeTruthy();
        expect(res.data.data.saveValue[0].value.id).toBe(recordIdLinked);
    });

    test('Save value advanced reverse link', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedReverseLinkName}",
                    value: {value: "${recordIdLinked}"}) {
                        id_value

                        ... on LinkValue {
                            value {
                                id
                            }
                        }
                    }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeTruthy();
        expect(res.data.data.saveValue[0].value.id).toBe(recordIdLinked);
    });

    test('Save value advanced reverse link into simple link', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedReverseLinkToSimpleLinkName}",
                    value: {value: "${recordIdLinked}"}) {
                        id_value

                        ... on LinkValue {
                            value {
                                id
                            }
                        }
                    }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue[0].id_value).toBeFalsy();
        expect(res.data.data.saveValue[0].value.id).toBe(recordIdLinked);
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
        const res = await makeGraphQlCall(`mutation {
                deleteValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}") { id_value }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
    });

    test('Delete value on tree attribute', async () => {
        const saveValueRes = await makeGraphQlCall(`mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrTreeName}",
                value: {value: "${nodeTreeElem}"}) {
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
                        value
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValueBatch.values).toHaveLength(2);
        expect(res.data.data.saveValueBatch.values[1].id_value).toBeTruthy();
    });

    describe('Date range attribute', () => {
        test('Save and get date range value', async () => {
            const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrDateRangeName}",
                    value: {
                        value: "{\\"from\\": 1000, \\"to\\": 2000}"
                    }
                ) {
                    id_value

                    ... on Value {
                        value
                    }
                }
              }`);

            expect(res.status).toBe(200);

            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.saveValue[0].value).toEqual({
                from: '1/1/1970, 12:16:40 AM',
                to: '1/1/1970, 12:33:20 AM'
            });
        });

        test("Don't save value if invalid (from > to)", async () => {
            const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrDateRangeName}",
                    value: {
                        value: "{\\"from\\": 2000, \\"to\\": 1000}"
                    }
                ) {
                    id_value

                    ... on Value {
                        value
                    }
                }
              }`);

            expect(res.status).toBe(200);

            expect(res.data.errors).toBeDefined();
            expect(res.data.errors[0].extensions.fields[attrDateRangeName]).toBeDefined();
        });
    });
});
