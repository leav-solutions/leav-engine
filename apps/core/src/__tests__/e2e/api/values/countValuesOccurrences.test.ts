// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordPermissionsActions} from '../../../../_types/permissions';
import {AttributeTypes} from '../../../../_types/attribute';
import {e2eGuestUser, gqlAddElemToTree, gqlSaveAttribute, gqlSaveTree, makeGraphQlCall} from '../e2eUtils';
import {AttributeCondition} from '../../../..//_types/record';

describe('countValuesOccurrences', () => {
    const testLibName = 'count_values_library_test';

    const treeName = 'count_tree_test';
    const treeLibName = 'count_tree_library_test';

    const attrSimpleName = 'count_values_attribute_test_simple';
    const attrTreeMonoValueName = 'count_values_attribute_test_tree_mono_value';
    const attrTreeMultiValueName = 'count_values_attribute_test_tree_multi_value';

    let node1RecordId1: string;
    let node1RecordId2: string;
    let node1RecordId3: string;
    let node2RecordId1: string;
    let node2RecordId2: string;
    let node3RecordId1: string;
    let node3RecordId2: string;
    let noNodeRecordId1: string;
    let treeNodeId1: string;
    let treeNodeId2: string;
    let treeNodeId3: string;

    beforeAll(async () => {
        await gqlSaveAttribute({
            id: attrSimpleName,
            type: AttributeTypes.SIMPLE,
            label: 'Test attr simple',
        });

        // Create library to use in tree
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${treeLibName}", 
                label: {en: "Test tree lib"},
            }) { id }
        }`);

        // create tree
        await gqlSaveTree(treeName, 'Test tree', [treeLibName]);

        // Create tree attribute linking to tree
        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrTreeMonoValueName}",
                    type: tree,
                    linked_tree: "${treeName}",
                    multiple_values: false,
                    label: {en: "Test tree attr mini"}
                }
            ) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrTreeMultiValueName}",
                    type: tree,
                    linked_tree: "${treeName}",
                    multiple_values: true,
                    label: {en: "Test tree attr multi"}
                }
            ) { id }
        }`);

        // Create library
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${testLibName}",
                label: {en: "Test lib"},
                attributes: [
                    "${attrSimpleName}",
                    "${attrTreeMonoValueName}",
                    "${attrTreeMultiValueName}",
                ],
                permissions_conf: {permissionTreeAttributes: ["${attrTreeMonoValueName}"], relation: and}
            }) { id }
        }`);

        // Create tree records
        const resTreeRecord = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${treeLibName}") { record {id} },
            c2: createRecord(library: "${treeLibName}") { record {id} },
            c3: createRecord(library: "${treeLibName}") { record {id} },
        }`);

        treeNodeId1 = await gqlAddElemToTree(treeName, {
            id: resTreeRecord.data.data.c1.record.id,
            library: treeLibName,
        });
        treeNodeId2 = await gqlAddElemToTree(treeName, {
            id: resTreeRecord.data.data.c2.record.id,
            library: treeLibName,
        });
        treeNodeId3 = await gqlAddElemToTree(treeName, {
            id: resTreeRecord.data.data.c3.record.id,
            library: treeLibName,
        });

        const resRecord = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${testLibName}", data: { values: [{ attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId1}"}]}) { record {id} },
            c2: createRecord(library: "${testLibName}", data: { values: [{ attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId1}"}]}) { record {id} },
            c3: createRecord(library: "${testLibName}", data: { values: [{ attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId1}"}]}) { record {id} },
            c4: createRecord(library: "${testLibName}", data: { values: [{ attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId2}"}]}) { record {id} },
            c5: createRecord(library: "${testLibName}", data: { values: [{ attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId2}"}]}) { record {id} },
            c6: createRecord(library: "${testLibName}", data: { values: [{ attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId3}"}]}) { record {id} },
            c7: createRecord(library: "${testLibName}", data: { values: [{ attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId3}"}]}) { record {id} },
            c8: createRecord(library: "${testLibName}") { record {id} },
        }`);
        node1RecordId1 = resRecord.data.data.c1.record.id;
        node1RecordId2 = resRecord.data.data.c2.record.id;
        node1RecordId3 = resRecord.data.data.c3.record.id;
        node2RecordId1 = resRecord.data.data.c4.record.id;
        node2RecordId2 = resRecord.data.data.c5.record.id;
        node3RecordId1 = resRecord.data.data.c6.record.id;
        node3RecordId2 = resRecord.data.data.c7.record.id;
        noNodeRecordId1 = resRecord.data.data.c8.record.id;
    });

    it('should throw error if attribute is not of tree type', async () => {
        const gqlQuery = `query {
            countValuesOccurrences(
                library: "${testLibName}",
                attribute: "${attrSimpleName}"
            ) {
                occurrences {
                    count
                }
            }
        }`;

        await expect(makeGraphQlCall(gqlQuery)).rejects.toThrow(
            /Attribute type simple is not supported for this operation/,
        );
    });

    it('without record filters should count occurrences of tree values', async () => {
        const {occurrences, noValueCount} = await countValuesOccurrences(testLibName, attrTreeMonoValueName);

        expect(occurrences.length).toBe(3);
        expect(occurrences).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    count: 3,
                    value: expect.objectContaining({
                        id: treeNodeId1,
                    }),
                }),
                expect.objectContaining({
                    count: 2,
                    value: expect.objectContaining({
                        id: treeNodeId2,
                    }),
                }),
                expect.objectContaining({
                    count: 2,
                    value: expect.objectContaining({
                        id: treeNodeId3,
                    }),
                }),
            ]),
        );
        expect(noValueCount).toBe(1);
    });

    it('with record filters should count occurrences of tree values', async () => {
        const {occurrences, noValueCount} = await countValuesOccurrences(
            testLibName,
            attrTreeMonoValueName,
            `[
                    {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${node1RecordId1}"}
                    {operator: OR },
                    {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${node2RecordId1}"}
                    {operator: OR },
                    {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${noNodeRecordId1}"}
                ]`,
        );

        expect(occurrences.length).toBe(2);
        expect(occurrences).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    count: 1,
                    value: expect.objectContaining({
                        id: treeNodeId1,
                    }),
                }),
                expect.objectContaining({
                    count: 1,
                    value: expect.objectContaining({
                        id: treeNodeId2,
                    }),
                }),
            ]),
        );
        expect(noValueCount).toBe(1);
    });

    describe('reduce access permissions on record linked to node2', () => {
        beforeAll(async () => {
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
                                {name: ${RecordPermissionsActions.ACCESS_RECORD}, allowed: false},
                            ]
                        }
                    ) { 
                        type
                    }
                }`,
            );
        });

        afterAll(async () => {
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
                                {name: ${RecordPermissionsActions.ACCESS_RECORD}, allowed: null},
                            ]
                        }
                    ) { 
                        type
                    }
                }`,
            );
        });

        it('without record filters should count occurrences of tree values', async () => {
            const {occurrences, noValueCount} = await countValuesOccurrences(testLibName, attrTreeMonoValueName);

            expect(occurrences.length).toBe(2);
            expect(occurrences).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        count: 3,
                        value: expect.objectContaining({
                            id: treeNodeId1,
                        }),
                    }),
                    expect.objectContaining({
                        count: 2,
                        value: expect.objectContaining({
                            id: treeNodeId3,
                        }),
                    }),
                ]),
            );
            expect(noValueCount).toBe(1);
        });
    });

    async function countValuesOccurrences(
        libraryId: string,
        attributeId: string,
        recordFilters?: string,
    ): Promise<{occurrences: any[]; noValueCount: number}> {
        const gqlQuery = `query {
            countValuesOccurrences(
                library: "${libraryId}",
                attribute: "${attributeId}"
                ${recordFilters ? `, recordFilters: ${recordFilters}` : ''}
            ) {
                occurrences {
                    count
                    ... on TreeValueOccurrences {
                        value {
                            id
                        }
                    }
                }
                noValueCount
            }
        }`;

        const res = await makeGraphQlCall(gqlQuery, {
            user: e2eGuestUser(),
        });

        return res.data.data.countValuesOccurrences;
    }

    async function listDistinctValues(
        libraryId: string,
        attributeId: string,
        recordFilters?: string,
    ): Promise<Array<{count: number; treeNode?: {value: {id: string}}; record?: {value: {id: string}}}>> {
        const gqlQuery = `query {
            listDistinctValues(
                library: "${libraryId}",
                attribute: "${attributeId}"
                ${recordFilters ? `, recordFilters: ${recordFilters}` : ''}
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
                }
            
        }`;

        const res = await makeGraphQlCall(gqlQuery, {
            user: e2eGuestUser(),
        });

        return res.data.data.listDistinctValues;
    }
});
