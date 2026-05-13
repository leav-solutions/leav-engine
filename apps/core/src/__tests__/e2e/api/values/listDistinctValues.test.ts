import {RecordPermissionsActions} from '../../../../_types/permissions';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {
    adminUserSdk,
    e2eGuestUser,
    gqlAddElemToTree,
    gqlSaveAttribute,
    gqlSaveTree,
    makeGraphQlCall,
} from '../e2eUtils';
import {AttributeCondition} from '../../../../_types/record';
import {type AttributeInput, AttributeType, AttributeFormat, type LibraryInput, LibraryBehavior} from '../../_gqlTypes';

describe('listDistinctValues', () => {
    const testLibName = 'list_distinct_values_library_test';

    const treeName = 'list_distinct_tree_test';
    const remoteLibName = 'list_distinct_tree_library_test';

    const attrSimpleTextName = 'list_distinct_values_attribute_test_simple_text';
    const attrSimpleLinkName = 'list_distinct_values_attribute_test_simple_link';
    const attrAdvancedReverseLinkValueName = 'list_distinct_values_attribute_test_advanced_reverse_link_mono_value';
    const attrAdvancedTextMonoValueName = 'list_distinct_values_attribute_test_advanced_text_mono_value';
    const attrAdvancedTextMultiValueName = 'list_distinct_values_attribute_test_advanced_text_multi_value';
    const attrAdvancedLinkMonoValueName = 'list_distinct_values_attribute_test_advanced_link_mono_value';
    const attrAdvancedLinkMultiValueName = 'list_distinct_values_attribute_test_advanced_link_multi_value';
    const attrTreeMonoValueName = 'list_distinct_values_attribute_test_tree_mono_value';
    const attrTreeMultiValueName = 'list_distinct_values_attribute_test_tree_multi_value';

    const mandatoryJoinAttribute: AttributeInput = {
        id: 'list_distinct_values_attribute_test_mandatory_join_attribute',
        type: AttributeType.simple_link,
        format: AttributeFormat.text,
        label: {fr: 'Test attr', en: 'Test attr en'},
        linked_library: remoteLibName,
    };

    const joinLibrary: LibraryInput = {
        id: 'list_distinct_values_join_library',
        behavior: LibraryBehavior.join,
        attributes: [mandatoryJoinAttribute.id],
        mandatoryAttribute: mandatoryJoinAttribute.id,
    };

    const joinAttribute: AttributeInput = {
        id: 'list_distinct_values_attribute_test_join_attribute',
        type: AttributeType.advanced_link,
        multiple_values: true,
        format: AttributeFormat.text,
        label: {fr: 'Test attr', en: 'Test attr en'},
        linked_library: joinLibrary.id,
    };

    let remoteRecordId1: string;
    let remoteRecordId2: string;
    let remoteRecordId3: string;
    let remoteRecordId4: string;
    let remoteRecordId5: string;
    let remoteRecordId6: string;
    let recordId1: string;
    let recordId2: string;
    let recordId3: string;
    let recordId4: string;
    let recordId5: string;
    let recordId6: string;
    let recordId7: string;
    let recordId8: string;
    let treeNodeId1: string;
    let treeNodeId2: string;
    let treeNodeId3: string;

    beforeAll(async () => {
        await gqlSaveAttribute({
            id: attrSimpleTextName,
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
            label: 'Test attr simple text',
        });
        await gqlSaveAttribute({
            id: attrSimpleLinkName,
            type: AttributeTypes.SIMPLE_LINK,
            label: 'Test attr simple link',
            linkedLibrary: remoteLibName,
        });
        await gqlSaveAttribute({
            id: attrAdvancedReverseLinkValueName,
            type: AttributeTypes.ADVANCED_LINK,
            label: 'Test attr advanced link mono value',
            linkedLibrary: testLibName,
            reverseLink: attrSimpleLinkName,
            multipleValues: false,
        });
        await gqlSaveAttribute({
            id: attrAdvancedTextMonoValueName,
            type: AttributeTypes.ADVANCED,
            label: 'Test attr advanced text mono value',
            format: AttributeFormats.TEXT,
            multipleValues: false,
        });
        await gqlSaveAttribute({
            id: attrAdvancedTextMultiValueName,
            type: AttributeTypes.ADVANCED,
            label: 'Test attr advanced text multi value',
            format: AttributeFormats.TEXT,
            multipleValues: true,
        });
        await gqlSaveAttribute({
            id: attrAdvancedLinkMonoValueName,
            type: AttributeTypes.ADVANCED_LINK,
            label: 'Test attr advanced link mono value',
            linkedLibrary: remoteLibName,
            multipleValues: false,
        });
        await gqlSaveAttribute({
            id: attrAdvancedLinkMultiValueName,
            type: AttributeTypes.ADVANCED_LINK,
            label: 'Test attr advanced link multi value',
            linkedLibrary: remoteLibName,
            multipleValues: true,
        });

        // Create library to use in tree nodes and link records
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${remoteLibName}", 
                label: {en: "Test tree lib"},
                attributes: [
                    "${attrAdvancedReverseLinkValueName}",
                ],
            }) { id }
        }`);

        // create tree
        await gqlSaveTree(treeName, 'Test tree', [remoteLibName]);

        // Create tree attribute linking to tree
        await gqlSaveAttribute({
            id: attrTreeMonoValueName,
            type: AttributeTypes.TREE,
            label: 'Test attr tree mono value',
            linkedTree: treeName,
            multipleValues: false,
        });

        await gqlSaveAttribute({
            id: attrTreeMultiValueName,
            type: AttributeTypes.TREE,
            label: 'Test attr tree multi value',
            linkedTree: treeName,
            multipleValues: true,
        });

        await adminUserSdk.SaveAttribute({
            attribute: mandatoryJoinAttribute,
        });
        await adminUserSdk.SaveLibrary({
            library: joinLibrary,
        });
        await adminUserSdk.SaveAttribute({
            attribute: joinAttribute,
        });

        // Create library
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${testLibName}",
                label: {en: "Test lib"},
                attributes: [
                    "${attrSimpleTextName}",
                    "${attrSimpleLinkName}",
                    "${attrAdvancedTextMonoValueName}",
                    "${attrAdvancedTextMultiValueName}",
                    "${attrAdvancedLinkMonoValueName}",
                    "${attrAdvancedLinkMultiValueName}",
                    "${attrTreeMonoValueName}",
                    "${attrTreeMultiValueName}",
                    "${joinAttribute.id}",
                ],
                permissions_conf: {permissionTreeAttributes: ["${attrTreeMonoValueName}"], relation: and}
            }) { id }
        }`);

        // Create remote records for link and tree nodes
        const resRemoteRecord = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${remoteLibName}") { record {id} },
            c2: createRecord(library: "${remoteLibName}") { record {id} },
            c3: createRecord(library: "${remoteLibName}") { record {id} },
            c4: createRecord(library: "${remoteLibName}") { record {id} },
            c5: createRecord(library: "${remoteLibName}") { record {id} },
            c6: createRecord(library: "${remoteLibName}") { record {id} },
        }`);
        remoteRecordId1 = resRemoteRecord.data.data.c1.record.id;
        remoteRecordId2 = resRemoteRecord.data.data.c2.record.id;
        remoteRecordId3 = resRemoteRecord.data.data.c3.record.id;
        remoteRecordId4 = resRemoteRecord.data.data.c4.record.id;
        remoteRecordId5 = resRemoteRecord.data.data.c5.record.id;
        remoteRecordId6 = resRemoteRecord.data.data.c6.record.id;

        treeNodeId1 = await gqlAddElemToTree(treeName, {
            id: remoteRecordId1,
            library: remoteLibName,
        });
        treeNodeId2 = await gqlAddElemToTree(treeName, {
            id: remoteRecordId2,
            library: remoteLibName,
        });
        treeNodeId3 = await gqlAddElemToTree(treeName, {
            id: remoteRecordId3,
            library: remoteLibName,
        });

        const resRecord = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${testLibName}", data: { values: [
                { attribute: "${attrSimpleTextName}", payload: "value1"},
                { attribute: "${attrAdvancedTextMonoValueName}", payload: "value1"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value1"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value2"},
                { attribute: "${attrSimpleLinkName}", payload: "${remoteRecordId1}"},
                { attribute: "${attrAdvancedLinkMonoValueName}", payload: "${remoteRecordId1}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId1}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId2}"},
                { attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId1}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId1}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId2}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId3}"}
                { attribute: "${joinAttribute.id}", payload: "${remoteRecordId1}"}
                { attribute: "${joinAttribute.id}", payload: "${remoteRecordId2}"}
            ]}) { record {id} },
            c2: createRecord(library: "${testLibName}", data: { values: [
                { attribute: "${attrSimpleTextName}", payload: "value1"},
                { attribute: "${attrAdvancedTextMonoValueName}", payload: "value1"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value1"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value3"},
                { attribute: "${attrSimpleLinkName}", payload: "${remoteRecordId1}"},
                { attribute: "${attrAdvancedLinkMonoValueName}", payload: "${remoteRecordId1}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId1}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId3}"},
                { attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId1}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId1}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId3}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId3}"}
                { attribute: "${joinAttribute.id}", payload: "${remoteRecordId3}"}
                { attribute: "${joinAttribute.id}", payload: "${remoteRecordId4}"}
            ]}) { record {id} },
            c3: createRecord(library: "${testLibName}", data: { values: [
                { attribute: "${attrSimpleTextName}", payload: "value2"},
                { attribute: "${attrAdvancedTextMonoValueName}", payload: "value2"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value1"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value4"},
                { attribute: "${attrSimpleLinkName}", payload: "${remoteRecordId2}"},
                { attribute: "${attrAdvancedLinkMonoValueName}", payload: "${remoteRecordId2}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId1}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId4}"},
                { attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId1}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId1}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId2}"}
                { attribute: "${joinAttribute.id}", payload: "${remoteRecordId5}"}
            ]}) { record {id} },
            c4: createRecord(library: "${testLibName}", data: { values: [
                { attribute: "${attrSimpleTextName}", payload: "value2"},
                { attribute: "${attrAdvancedTextMonoValueName}", payload: "value2"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value1"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value5"},
                { attribute: "${attrSimpleLinkName}", payload: "${remoteRecordId2}"},
                { attribute: "${attrAdvancedLinkMonoValueName}", payload: "${remoteRecordId2}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId1}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId5}"},
                { attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId2}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId1}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId2}"}
                { attribute: "${joinAttribute.id}", payload: "${remoteRecordId1}"}
                { attribute: "${joinAttribute.id}", payload: "${remoteRecordId2}"}
                { attribute: "${joinAttribute.id}", payload: "${remoteRecordId3}"}
                { attribute: "${joinAttribute.id}", payload: "${remoteRecordId4}"}
            ]}) { record {id} },
            c5: createRecord(library: "${testLibName}", data: { values: [
                { attribute: "${attrSimpleTextName}", payload: "value3"},
                { attribute: "${attrAdvancedTextMonoValueName}", payload: "value3"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value1"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value2"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value3"},
                { attribute: "${attrSimpleLinkName}", payload: "${remoteRecordId3}"},
                { attribute: "${attrAdvancedLinkMonoValueName}", payload: "${remoteRecordId3}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId1}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId2}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId3}"},
                { attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId2}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId1}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId2}"}
                { attribute: "${joinAttribute.id}", payload: "${remoteRecordId3}"}
            ]}) { record {id} },
            c6: createRecord(library: "${testLibName}", data: { values: [
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value1"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value2"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value3"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value4"},
                { attribute: "${attrAdvancedTextMultiValueName}", payload: "value5"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId1}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId2}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId3}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId4}"},
                { attribute: "${attrAdvancedLinkMultiValueName}", payload: "${remoteRecordId5}"},
                { attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId3}"}
                { attribute: "${attrTreeMultiValueName}", payload: "${treeNodeId1}"}
            ]}) { record {id} },
            c7: createRecord(library: "${testLibName}", data: { values: [
                { attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId3}"}
            ]}) { record {id} },
            c8: createRecord(library: "${testLibName}") { record {id} },
        }`);
        recordId1 = resRecord.data.data.c1.record.id;
        recordId2 = resRecord.data.data.c2.record.id;
        recordId3 = resRecord.data.data.c3.record.id;
        recordId4 = resRecord.data.data.c4.record.id;
        recordId5 = resRecord.data.data.c5.record.id;
        recordId6 = resRecord.data.data.c6.record.id;
        recordId7 = resRecord.data.data.c7.record.id;
        recordId8 = resRecord.data.data.c8.record.id;
    });

    describe('With simple text value attribute', () => {
        it('without record filters should return all set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrSimpleTextName);

            expect(distinctValues.length).toBe(4);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 2,
                        value: 'value1',
                    }),
                    expect.objectContaining({
                        count: 2,
                        value: 'value2',
                    }),
                    expect.objectContaining({
                        count: 1,
                        value: 'value3',
                    }),
                    {count: 3, value: null},
                ]),
            );
        });

        it('with record filters should return some set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrSimpleTextName, [
                recordId1,
                recordId2,
                recordId3,
                recordId8,
            ]);

            expect(distinctValues.length).toBe(3);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 2,
                        value: 'value1',
                    }),
                    expect.objectContaining({
                        count: 1,
                        value: 'value2',
                    }),
                    {count: 1, value: null},
                ]),
            );
        });

        it('with record filters should return some set values, no null', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrSimpleTextName, [
                recordId1,
                recordId2,
                recordId3,
            ]);

            expect(distinctValues.length).toBe(2);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 2,
                        value: 'value1',
                    }),
                    expect.objectContaining({
                        count: 1,
                        value: 'value2',
                    }),
                ]),
            );
        });
    });

    describe('With simple link value attribute', () => {
        it('without record filters should return all set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrSimpleLinkName);

            expect(distinctValues.length).toBe(4);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 2,
                        record: expect.objectContaining({
                            id: remoteRecordId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 2,
                        record: expect.objectContaining({
                            id: remoteRecordId2,
                        }),
                    }),
                    expect.objectContaining({
                        count: 1,
                        record: expect.objectContaining({
                            id: remoteRecordId3,
                        }),
                    }),
                    {count: 3, record: null},
                ]),
            );
        });

        it('with record filters should return some set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrSimpleLinkName, [
                recordId1,
                recordId2,
                recordId3,
                recordId8,
            ]);

            expect(distinctValues.length).toBe(3);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 2,
                        record: expect.objectContaining({
                            id: remoteRecordId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 1,
                        record: expect.objectContaining({
                            id: remoteRecordId2,
                        }),
                    }),
                    {count: 1, record: null},
                ]),
            );
        });

        it('with record filters should return some set values, no null', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrSimpleLinkName, [
                recordId1,
                recordId2,
                recordId3,
            ]);

            expect(distinctValues.length).toBe(2);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 2,
                        record: expect.objectContaining({
                            id: remoteRecordId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 1,
                        record: expect.objectContaining({
                            id: remoteRecordId2,
                        }),
                    }),
                ]),
            );
        });

        describe('With advanced reverse link attribute', () => {
            it('without record filters should return all set values', async () => {
                const distinctValues = await listDistinctValues(remoteLibName, attrAdvancedReverseLinkValueName);

                expect(distinctValues.length).toBe(6);
                expect(distinctValues).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            count: 1,
                            record: expect.objectContaining({
                                id: recordId1,
                            }),
                        }),
                        expect.objectContaining({
                            count: 1,
                            record: expect.objectContaining({
                                id: recordId2,
                            }),
                        }),
                        expect.objectContaining({
                            count: 1,
                            record: expect.objectContaining({
                                id: recordId3,
                            }),
                        }),
                        expect.objectContaining({
                            count: 1,
                            record: expect.objectContaining({
                                id: recordId4,
                            }),
                        }),
                        expect.objectContaining({
                            count: 1,
                            record: expect.objectContaining({
                                id: recordId5,
                            }),
                        }),
                        {count: 3, record: null},
                    ]),
                );
            });
        });
    });

    describe('With advanced text mono value attribute', () => {
        it('without record filters should return all set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrAdvancedTextMonoValueName);

            expect(distinctValues.length).toBe(4);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 2,
                        value: 'value1',
                    }),
                    expect.objectContaining({
                        count: 2,
                        value: 'value2',
                    }),
                    expect.objectContaining({
                        count: 1,
                        value: 'value3',
                    }),
                    {count: 3, value: null},
                ]),
            );
        });
    });

    describe('With advanced text multi value attribute', () => {
        it('without record filters should return all set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrAdvancedTextMultiValueName);

            expect(distinctValues.length).toBe(6);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 6,
                        value: 'value1',
                    }),
                    expect.objectContaining({
                        count: 3,
                        value: 'value2',
                    }),
                    expect.objectContaining({
                        count: 3,
                        value: 'value3',
                    }),
                    expect.objectContaining({
                        count: 2,
                        value: 'value4',
                    }),
                    expect.objectContaining({
                        count: 2,
                        value: 'value5',
                    }),
                    {count: 2, value: null},
                ]),
            );
        });

        it('with record filters should return some set values, no null', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrAdvancedTextMultiValueName, [
                recordId1,
                recordId2,
                recordId3,
            ]);

            expect(distinctValues.length).toBe(4);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 3,
                        value: 'value1',
                    }),
                    expect.objectContaining({
                        count: 1,
                        value: 'value2',
                    }),
                    expect.objectContaining({
                        count: 1,
                        value: 'value3',
                    }),
                    expect.objectContaining({
                        count: 1,
                        value: 'value4',
                    }),
                ]),
            );
        });
    });

    describe('With advanced link mono value attribute', () => {
        it('without record filters should return all set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrAdvancedTextMonoValueName);

            expect(distinctValues.length).toBe(4);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 2,
                        value: 'value1',
                    }),
                    expect.objectContaining({
                        count: 2,
                        value: 'value2',
                    }),
                    expect.objectContaining({
                        count: 1,
                        value: 'value3',
                    }),
                    {count: 3, value: null},
                ]),
            );
        });
    });

    describe('With advanced link multi value attribute', () => {
        it('without record filters should return all set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrAdvancedLinkMultiValueName);

            expect(distinctValues.length).toBe(6);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 6,
                        record: expect.objectContaining({
                            id: remoteRecordId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 3,
                        record: expect.objectContaining({
                            id: remoteRecordId2,
                        }),
                    }),
                    expect.objectContaining({
                        count: 3,
                        record: expect.objectContaining({
                            id: remoteRecordId3,
                        }),
                    }),
                    expect.objectContaining({
                        count: 2,
                        record: expect.objectContaining({
                            id: remoteRecordId4,
                        }),
                    }),
                    expect.objectContaining({
                        count: 2,
                        record: expect.objectContaining({
                            id: remoteRecordId5,
                        }),
                    }),
                    {count: 2, record: null},
                ]),
            );
        });

        it('with record filters should return some set values, no null', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrAdvancedLinkMultiValueName, [
                recordId1,
                recordId2,
                recordId3,
            ]);

            expect(distinctValues.length).toBe(4);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 3,
                        record: expect.objectContaining({
                            id: remoteRecordId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 1,
                        record: expect.objectContaining({
                            id: remoteRecordId2,
                        }),
                    }),
                    expect.objectContaining({
                        count: 1,
                        record: expect.objectContaining({
                            id: remoteRecordId3,
                        }),
                    }),
                    expect.objectContaining({
                        count: 1,
                        record: expect.objectContaining({
                            id: remoteRecordId4,
                        }),
                    }),
                ]),
            );
        });
    });

    describe('With tree mono value attribute', () => {
        it('without record filters should return all set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrTreeMonoValueName);

            expect(distinctValues.length).toBe(4);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 3,
                        treeNode: expect.objectContaining({
                            id: treeNodeId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 2,
                        treeNode: expect.objectContaining({
                            id: treeNodeId2,
                        }),
                    }),
                    expect.objectContaining({
                        count: 2,
                        treeNode: expect.objectContaining({
                            id: treeNodeId3,
                        }),
                    }),
                    {count: 1, treeNode: null},
                ]),
            );
        });

        it('with record filters should return some set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrTreeMonoValueName, [
                recordId1,
                recordId4,
                recordId8,
            ]);

            expect(distinctValues.length).toBe(3);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 1,
                        treeNode: expect.objectContaining({
                            id: treeNodeId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 1,
                        treeNode: expect.objectContaining({
                            id: treeNodeId2,
                        }),
                    }),
                    {count: 1, treeNode: null},
                ]),
            );
        });
    });

    describe('With tree multi value attribute', () => {
        it('without record filters should return all set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrTreeMultiValueName);

            expect(distinctValues.length).toBe(4);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 6,
                        treeNode: expect.objectContaining({
                            id: treeNodeId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 4,
                        treeNode: expect.objectContaining({
                            id: treeNodeId2,
                        }),
                    }),
                    expect.objectContaining({
                        count: 3,
                        treeNode: expect.objectContaining({
                            id: treeNodeId3,
                        }),
                    }),
                    {count: 2, treeNode: null},
                ]),
            );
        });

        it('with record filters should return some set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrTreeMultiValueName, [
                recordId4,
                recordId5,
                recordId6,
                recordId7,
                recordId8,
            ]);

            expect(distinctValues.length).toBe(3);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 3,
                        treeNode: expect.objectContaining({
                            id: treeNodeId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 2,
                        treeNode: expect.objectContaining({
                            id: treeNodeId2,
                        }),
                    }),
                    {count: 2, treeNode: null},
                ]),
            );
        });
    });

    describe('With advanced link multi value attribute through join library', () => {
        it('without record filters should return all set values', async () => {
            const distinctValues = await listDistinctValues(testLibName, joinAttribute.id);

            expect(distinctValues.length).toBe(6);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 2,
                        record: expect.objectContaining({
                            id: remoteRecordId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 2,
                        record: expect.objectContaining({
                            id: remoteRecordId2,
                        }),
                    }),
                    expect.objectContaining({
                        count: 3,
                        record: expect.objectContaining({
                            id: remoteRecordId3,
                        }),
                    }),
                    expect.objectContaining({
                        count: 2,
                        record: expect.objectContaining({
                            id: remoteRecordId4,
                        }),
                    }),
                    expect.objectContaining({
                        count: 1,
                        record: expect.objectContaining({
                            id: remoteRecordId5,
                        }),
                    }),
                    {count: 3, record: null},
                ]),
            );
        });

        it('with record filters should return some set values, no null', async () => {
            const distinctValues = await listDistinctValues(testLibName, joinAttribute.id, [
                recordId1,
                recordId2,
                recordId5,
                recordId6,
            ]);

            expect(distinctValues.length).toBe(5);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 1,
                        record: expect.objectContaining({
                            id: remoteRecordId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 1,
                        record: expect.objectContaining({
                            id: remoteRecordId2,
                        }),
                    }),
                    expect.objectContaining({
                        count: 2,
                        record: expect.objectContaining({
                            id: remoteRecordId3,
                        }),
                    }),
                    expect.objectContaining({
                        count: 1,
                        record: expect.objectContaining({
                            id: remoteRecordId4,
                        }),
                    }),
                    {count: 1, record: null},
                ]),
            );
        });
    });

    describe('reduce access permissions on record linked to node2 (record 4,5)', () => {
        const setupPermission = async (allowed: boolean | null) => {
            await makeGraphQlCall(
                `mutation {
                    savePermission(
                        permission: {
                            type: record,
                            applyTo: "${testLibName}",
                            usersGroup: null,
                            permissionTreeTarget: {
                                tree: "${treeName}", nodeId: "${treeNodeId2}"
                            },
                            actions: [
                                {name: ${RecordPermissionsActions.ACCESS_RECORD}, allowed: ${allowed}},
                            ]
                        }
                    ) { 
                        type
                    }
                }`,
            );
        };
        beforeAll(async () => {
            await setupPermission(false);
        });

        afterAll(async () => {
            await setupPermission(null);
        });

        it('without record filters should return some simple link values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrSimpleLinkName);

            expect(distinctValues.length).toBe(3);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 2,
                        record: expect.objectContaining({
                            id: remoteRecordId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 1,
                        record: expect.objectContaining({
                            id: remoteRecordId2,
                        }),
                    }),
                    {count: 3, record: null},
                ]),
            );
        });

        it('without record filters should return some tree values', async () => {
            const distinctValues = await listDistinctValues(testLibName, attrTreeMonoValueName);

            expect(distinctValues.length).toBe(3);
            expect(distinctValues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 3,
                        treeNode: expect.objectContaining({
                            id: treeNodeId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 2,
                        treeNode: expect.objectContaining({
                            id: treeNodeId3,
                        }),
                    }),
                    {count: 1, treeNode: null},
                ]),
            );
        });

        // and some for each other attribute type as needed
    });

    async function listDistinctValues(
        libraryId: string,
        attributeId: string,
        filterByRecordIds?: string[],
    ): Promise<Array<{count: number; treeNode?: {value: {id: string}}; record?: {value: {id: string}}}>> {
        const recordFilters = filterByRecordIds
            ? filterByRecordIds
                  .map(
                      (id, idx) =>
                          `{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${id}"}${idx < filterByRecordIds.length - 1 ? '\n{operator: OR },' : ''}`,
                  )
                  .join('\n')
            : '';
        const gqlQuery = `query {
            listDistinctValues(
                library: "${libraryId}",
                attribute: "${attributeId}"
                ${filterByRecordIds ? `, recordFilters: [${recordFilters}]` : ''}
            ) {
                    count
                    ... on TreeDistinctValues {
                        treeNode: value {
                            id
                        }
                    }
                    ... on LinkDistinctValues {
                        record: value {
                            id
                        }
                    }
                    ... on StandardDistinctValues {
                        value
                    }
                }
            
        }`;

        const res = await makeGraphQlCall(gqlQuery, {
            user: e2eGuestUser(),
        });

        return res.data.data.listDistinctValues;
    }
});
