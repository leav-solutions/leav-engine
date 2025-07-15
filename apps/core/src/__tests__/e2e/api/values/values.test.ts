// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeCondition} from '../../../../_types/record';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {gqlAddElemToTree, gqlCreateRecord, gqlSaveAttribute, gqlSaveTree, makeGraphQlCall} from '../e2eUtils';
import {ILinkValue} from '_types/value';

describe('Values', () => {
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

        await gqlSaveAttribute({
            id: attrSimpleNameWithFormat,
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
            label: 'Test attr simple with format',
            actionsList: {
                getValue: [{id: 'toUppercase', name: 'toUppercase'}]
            }
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
                        "${attrSimpleNameWithFormat}",
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

    test('Save same value on unique attribute', async () => {
        const res = await makeGraphQlCall(`mutation {
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
                    value: {payload: "AAAATEST VAL"}) {
                        id_value

                        ... on Value {
                            payload
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
                                value: "${recordIdAdvancedLink}"
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
                    expect.arrayContaining([advancedLinkValue[0].id_value, advancedLinkValueBis[0].id_value])
                );
                expect(reverseLinkValues.map(v => v.payload.id)).toEqual(
                    expect.arrayContaining([recordIdAdvancedLink, recordIdAdvancedLinkBis])
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
                                value: "${recordIdSimpleLink}"
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
                    expect.arrayContaining([recordIdSimpleLink, recordIdSimpleLinkBis])
                );
                expect(reverseLinkValues.map(v => v.payload.id)).toEqual(
                    expect.arrayContaining([recordIdSimpleLink, recordIdSimpleLinkBis])
                );
            });

            test('Delete value should remove simple link from linked record', async () => {
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

                expect(await getSimpleLinkLinkedRecord(recordIdSimpleLink)).toBeUndefined();
                expect(await getReverseLinkFromRecord(recordIdReverseLink)).toHaveLength(0);
            });
        });

        async function getSimpleLinkLinkedRecord(recId: string): Promise<ILinkValue | undefined> {
            const resLinkedRecord = await makeGraphQlCall(`query {
                    records(
                        library: "${testLibName}",
                        filters: [ { field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recId}" }]
                    ) {
                        list {
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
                to: 2000
            });
        });

        test("Don't save value if invalid (from > to)", async () => {
            const res = await makeGraphQlCall(`mutation {
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
              }`);

            expect(res.status).toBe(200);

            expect(res.data.errors).toBeDefined();
            expect(res.data.errors[0].extensions.fields[attrDateRangeName]).toBeDefined();
        });
    });

    test('Run actions list and format on value', async () => {
        const res = await makeGraphQlCall(`query {
            runActionsListAndFormatOnValue(
                library: "${testLibName}",
                value: {
                    attribute: "${attrSimpleNameWithFormat}",
                    payload: "test",
                    metadata: null
                },
                version: null
            ) {
                id_value
                payload
                raw_payload
            }
        }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.runActionsListAndFormatOnValue[0].id_value).toBeNull();
        expect(res.data.data.runActionsListAndFormatOnValue[0].payload).toBe('TEST');
        expect(res.data.data.runActionsListAndFormatOnValue[0].raw_payload).toBe('test');
    });
});
