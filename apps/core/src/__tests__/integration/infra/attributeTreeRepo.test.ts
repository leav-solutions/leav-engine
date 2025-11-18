// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeTypes} from '../../../_types/attribute';
import {type IQueryInfos} from '_types/queryInfos';
import {type IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
import {type IRecordRepo} from 'infra/record/recordRepo';
import {type ILibraryRepo} from 'infra/library/libraryRepo';
import {type IRecord} from '_types/record';
import {getCoreDep, getLibraryRepo, getRecordRepo, getTreeRepo} from './integrationTestRepoUtils';
import {type ILinkValue, type ITreeValue, type IValueVersion} from '_types/value';
import {type ITreeRepo} from 'infra/tree/treeRepo';
import {type IAttributeTreeRepo} from 'infra/attributeTypes/attributeTreeRepo';
import {type ITreeNodeLight} from '_types/tree';

// Very partial tests, to be completed !
// TODO - createValue
// TODO - updateValue
// TODO - deleteValue
// TODO - isValueUsed
// TODO - getValueById
// TODO - clearAllValues
// Maybe - filterValueQueryPart (tested with recordRepo.find ?)
// Maybe - sortQueryPart (tested with recordRepo.find ?)
describe('attributeTreeRepo', () => {
    let recordRepo: IRecordRepo;
    let libraryRepo: ILibraryRepo;
    let treeRepo: ITreeRepo;
    let attributeTreeRepo: IAttributeTreeRepo;

    const libraryId = 'test_lib_attribute_tree_repo';
    const remoteLibraryId = 'test_lib_attribute_remote_tree_repo';
    const treeId = 'test_lib_attribute_remote_tree_repo_tree';
    const ctx: IQueryInfos = {
        userId: '1',
    };

    beforeAll(async () => {
        libraryRepo = getLibraryRepo();
        recordRepo = getRecordRepo();
        treeRepo = getTreeRepo();
        attributeTreeRepo = getCoreDep<IAttributeTreeRepo>('core.infra.attributeTypes.attributeTree');

        await libraryRepo.createLibrary({
            libData: {
                id: libraryId,
            },
            ctx,
        });
        await libraryRepo.createLibrary({
            libData: {
                id: remoteLibraryId,
            },
            ctx,
        });
        await treeRepo.createTree({
            treeData: {
                id: treeId,
                libraries: {
                    remoteLibraryId: {
                        allowedAtRoot: true,
                        allowMultiplePositions: false,
                        allowedChildren: [],
                    },
                },
            },
            ctx,
        });
    });

    const createRemoteRecord = (recordData: Record<string, any>): Promise<IRecord> =>
        recordRepo.createRecord({
            libraryId: remoteLibraryId,
            recordData,
            ctx,
        });

    const createRecord = (recordData: Record<string, any>): Promise<IRecord> =>
        recordRepo.createRecord({
            libraryId,
            recordData,
            ctx,
        });

    const createValue = async (
        attribute: IAttributeWithRevLink,
        recordId: string,
        payload: string,
        version: IValueVersion | null = null,
    ): Promise<ITreeValue> =>
        attributeTreeRepo.createValue({
            library: libraryId,
            attribute,
            recordId,
            value: {
                payload,
                created_at: Date.now(),
                modified_at: Date.now(),
                version,
            },
            ctx,
        });

    describe('6 remote nodes/records exists,', () => {
        let remoteRecord1: IRecord;
        let remoteRecord2: IRecord;
        let remoteRecord3: IRecord;
        let remoteRecord4: IRecord;
        let remoteRecord5: IRecord;
        let remoteRecord6: IRecord;
        let remoteNode1: ITreeNodeLight;
        let remoteNode2: ITreeNodeLight;
        let remoteNode3: ITreeNodeLight;
        let remoteNode4: ITreeNodeLight;
        let remoteNode5: ITreeNodeLight;
        let remoteNode6: ITreeNodeLight;

        beforeAll(async () => {
            [remoteRecord1, remoteRecord2, remoteRecord3, remoteRecord4, remoteRecord5, remoteRecord6] =
                await Promise.all(
                    Array.from({length: 6}).map((_, index) =>
                        createRemoteRecord({
                            [`attr_data_${index + 1}`]: index + 1,
                        }),
                    ),
                );

            [remoteNode1, remoteNode2, remoteNode3, remoteNode4, remoteNode5, remoteNode6] = await Promise.all(
                [remoteRecord1, remoteRecord2, remoteRecord3, remoteRecord4, remoteRecord5, remoteRecord6].map(
                    remoteRecord =>
                        treeRepo.addElement({
                            treeId,
                            element: {
                                id: remoteRecord.id,
                                library: remoteRecord.library,
                            },
                            parent: null,
                            ctx,
                        }),
                ),
            );
        });

        describe('2 nodes/records exists with tree mono attribute', () => {
            const treeMonoAttribute: IAttributeWithRevLink = {
                id: 'tree_attr_mono',
                type: AttributeTypes.TREE,
                linked_tree: treeId,
                multiple_values: false,
            };

            let record1: IRecord;
            let record2: IRecord;
            let record1Value: ILinkValue;
            let record2Value: ILinkValue;

            beforeAll(async () => {
                record1 = await createRecord({});
                record2 = await createRecord({});
                record1Value = await createValue(treeMonoAttribute, record1.id, remoteNode1.id);
                record2Value = await createValue(treeMonoAttribute, record2.id, remoteNode2.id);

                expect(record1Value).toMatchObject({
                    id_value: expect.any(String),
                    payload: {
                        id: remoteNode1.id,
                        record: remoteRecord1,
                    },
                    attribute: treeMonoAttribute.id,
                    modified_by: ctx.userId,
                    created_by: ctx.userId,
                    version: null,
                });
                expect(record2Value).toMatchObject({
                    id_value: expect.any(String),
                    payload: {
                        id: remoteNode2.id,
                        record: remoteRecord2,
                    },
                    attribute: treeMonoAttribute.id,
                    modified_by: ctx.userId,
                    created_by: ctx.userId,
                    version: null,
                });
            });

            describe('getValuesBatch', () => {
                test('Should return values in array for each record', async () => {
                    const values = await attributeTreeRepo.getValuesBatch({
                        library: libraryId,
                        attribute: treeMonoAttribute,
                        recordIds: [record1.id, record2.id],
                        ctx,
                    });

                    expect(values).toEqual([[record1Value], [record2Value]]);
                });

                test('Should return empty array for each not existing record', async () => {
                    const values = await attributeTreeRepo.getValuesBatch({
                        library: libraryId,
                        attribute: treeMonoAttribute,
                        recordIds: [record1.id, record2.id, 'no-exists'],
                        ctx,
                    });

                    expect(values).toEqual([[record1Value], [record2Value], []]);
                });

                test('Should return empty array for each record without attribute', async () => {
                    const record3WithoutAttr = await recordRepo.createRecord({
                        libraryId,
                        recordData: {},
                        ctx,
                    });

                    const values = await attributeTreeRepo.getValuesBatch({
                        library: libraryId,
                        attribute: treeMonoAttribute,
                        recordIds: [record1.id, record2.id, record3WithoutAttr.id],
                        ctx,
                    });

                    expect(values).toEqual([[record1Value], [record2Value], []]);
                });
            });

            describe('getValues', () => {
                test('Should return values for a record', async () => {
                    const values = await attributeTreeRepo.getValues({
                        library: libraryId,
                        attribute: treeMonoAttribute,
                        recordId: record1.id,
                        ctx,
                    });

                    expect(values).toEqual([record1Value]);
                });

                test('Should return empty array not existing record', async () => {
                    const values = await attributeTreeRepo.getValues({
                        library: libraryId,
                        attribute: treeMonoAttribute,
                        recordId: 'no-exists',
                        ctx,
                    });

                    expect(values).toEqual([]);
                });

                test('Should return empty array record without attribute', async () => {
                    const record3WithoutAttr = await createRecord({});

                    const values = await attributeTreeRepo.getValues({
                        library: libraryId,
                        attribute: treeMonoAttribute,
                        recordId: record3WithoutAttr.id,
                        ctx,
                    });

                    expect(values).toEqual([]);
                });
            });

            describe('countValuesOccurrences', () => {
                let record3: IRecord;
                let record4: IRecord;
                let record5: IRecord;
                let record6: IRecord;
                beforeAll(async () => {
                    record3 = await createRecord({});
                    record4 = await createRecord({});
                    record5 = await createRecord({});
                    record6 = await createRecord({});

                    await createValue(treeMonoAttribute, record3.id, remoteNode1.id);
                    await createValue(treeMonoAttribute, record4.id, remoteNode2.id);
                    await createValue(treeMonoAttribute, record5.id, remoteNode3.id);
                    // record6 has no value
                });

                test('Should return number of occurrences for each node (all)', async () => {
                    const occurrences = await attributeTreeRepo.countValuesOccurrences({
                        library: libraryId,
                        attribute: treeMonoAttribute,
                        recordIds: [record1.id, record2.id, record3.id, record4.id, record5.id, record6.id],
                        ctx,
                    });

                    expect(occurrences).toEqual(
                        expect.arrayContaining([
                            {
                                value: expect.objectContaining({
                                    id: remoteNode1.id,
                                    record: expect.objectContaining({id: remoteRecord1.id}),
                                }),
                                count: 2,
                            },
                            {
                                value: expect.objectContaining({
                                    id: remoteNode2.id,
                                    record: expect.objectContaining({id: remoteRecord2.id}),
                                }),
                                count: 2,
                            },
                            {
                                value: expect.objectContaining({
                                    id: remoteNode3.id,
                                    record: expect.objectContaining({id: remoteRecord3.id}),
                                }),
                                count: 1,
                            },
                        ]),
                    );
                    expect(occurrences).toHaveLength(3);
                });

                test('Should return number of occurrences for each node (partial)', async () => {
                    const occurrences = await attributeTreeRepo.countValuesOccurrences({
                        library: libraryId,
                        attribute: treeMonoAttribute,
                        recordIds: [record1.id, record5.id, record6.id],
                        ctx,
                    });

                    expect(occurrences).toEqual(
                        expect.arrayContaining([
                            {
                                value: expect.objectContaining({
                                    id: remoteNode1.id,
                                    record: expect.objectContaining({id: remoteRecord1.id}),
                                }),
                                count: 1,
                            },
                            {
                                value: expect.objectContaining({
                                    id: remoteNode3.id,
                                    record: expect.objectContaining({id: remoteRecord3.id}),
                                }),
                                count: 1,
                            },
                        ]),
                    );
                    expect(occurrences).toHaveLength(2);
                });

                test('Should return empty for record without values', async () => {
                    const occurrences = await attributeTreeRepo.countValuesOccurrences({
                        library: libraryId,
                        attribute: treeMonoAttribute,
                        recordIds: [record6.id],
                        ctx,
                    });

                    expect(occurrences).toHaveLength(0);
                });

                test('Should return empty for non existing records', async () => {
                    const occurrences = await attributeTreeRepo.countValuesOccurrences({
                        library: libraryId,
                        attribute: treeMonoAttribute,
                        recordIds: ['non-existing-record'],
                        ctx,
                    });

                    expect(occurrences).toHaveLength(0);
                });
            });

            describe('add version values', () => {
                const version1: IValueVersion = {
                    version1: 'node1',
                };
                let record1ValueV1: ILinkValue;
                let record2ValueV1: ILinkValue;
                beforeAll(async () => {
                    record1ValueV1 = await createValue(treeMonoAttribute, record1.id, remoteNode3.id, version1);
                    record2ValueV1 = await createValue(treeMonoAttribute, record2.id, remoteNode4.id, version1);

                    expect(record1ValueV1).toMatchObject({
                        version: version1,
                    });
                    expect(record2ValueV1).toMatchObject({
                        version: version1,
                    });
                });

                describe('getValuesBatch', () => {
                    test('Should return values in array for each record for null version', async () => {
                        const values = await attributeTreeRepo.getValuesBatch({
                            library: libraryId,
                            attribute: treeMonoAttribute,
                            recordIds: [record1.id, record2.id],
                            options: {version: null},
                            ctx,
                        });

                        expect(values).toEqual([[record1Value], [record2Value]]);
                    });

                    test('Should return values in array for each record for a specified version', async () => {
                        const values = await attributeTreeRepo.getValuesBatch({
                            library: libraryId,
                            attribute: treeMonoAttribute,
                            recordIds: [record1.id, record2.id],
                            options: {version: version1},
                            ctx,
                        });

                        expect(values).toEqual([[record1ValueV1], [record2ValueV1]]);
                    });

                    test('Should return all values in array for each record when use forceGetAllValues option', async () => {
                        const values = await attributeTreeRepo.getValuesBatch({
                            library: libraryId,
                            attribute: treeMonoAttribute,
                            recordIds: [record1.id, record2.id],
                            options: {forceGetAllValues: true},
                            ctx,
                        });
                        expect(values).toEqual([
                            expect.arrayContaining([record1Value, record1ValueV1]),
                            expect.arrayContaining([record2Value, record2ValueV1]),
                        ]);
                        expect(values[0]).toHaveLength(2);
                        expect(values[1]).toHaveLength(2);
                    });
                });

                describe('getValues', () => {
                    test('Should return values of a record for null version', async () => {
                        const values = await attributeTreeRepo.getValues({
                            library: libraryId,
                            attribute: treeMonoAttribute,
                            recordId: record1.id,
                            options: {version: null},
                            ctx,
                        });

                        expect(values).toEqual([record1Value]);
                    });

                    test('Should return values of a record for a specified version', async () => {
                        const values = await attributeTreeRepo.getValues({
                            library: libraryId,
                            attribute: treeMonoAttribute,
                            recordId: record1.id,
                            options: {version: version1},
                            ctx,
                        });

                        expect(values).toEqual([record1ValueV1]);
                    });

                    test('Should return all values of a record when use forceGetAllValues option', async () => {
                        const values = await attributeTreeRepo.getValues({
                            library: libraryId,
                            attribute: treeMonoAttribute,
                            recordId: record1.id,
                            forceGetAllValues: true,
                            ctx,
                        });

                        expect(values).toEqual(expect.arrayContaining([record1Value, record1ValueV1]));
                        expect(values).toHaveLength(2);
                    });
                });

                describe('countValuesOccurrences', () => {
                    test('Should return number of occurrences for each node (all, no version)', async () => {
                        const occurrences = await attributeTreeRepo.countValuesOccurrences({
                            library: libraryId,
                            attribute: treeMonoAttribute,
                            recordIds: [record1.id, record2.id],
                            options: {version: null},
                            ctx,
                        });

                        expect(occurrences).toEqual(
                            expect.arrayContaining([
                                {
                                    value: expect.objectContaining({
                                        id: remoteNode1.id,
                                        record: expect.objectContaining({id: remoteRecord1.id}),
                                    }),
                                    count: 1,
                                },
                                {
                                    value: expect.objectContaining({
                                        id: remoteNode2.id,
                                        record: expect.objectContaining({id: remoteRecord2.id}),
                                    }),
                                    count: 1,
                                },
                            ]),
                        );
                        expect(occurrences).toHaveLength(2);
                    });

                    test('Should return number of occurrences for each node (all, version 1)', async () => {
                        const occurrences = await attributeTreeRepo.countValuesOccurrences({
                            library: libraryId,
                            attribute: treeMonoAttribute,
                            recordIds: [record1.id, record2.id],
                            options: {version: version1},
                            ctx,
                        });

                        expect(occurrences).toEqual(
                            expect.arrayContaining([
                                {
                                    value: expect.objectContaining({
                                        id: remoteNode3.id,
                                        record: expect.objectContaining({id: remoteRecord3.id}),
                                    }),
                                    count: 1,
                                },
                                {
                                    value: expect.objectContaining({
                                        id: remoteNode4.id,
                                        record: expect.objectContaining({id: remoteRecord4.id}),
                                    }),
                                    count: 1,
                                },
                            ]),
                        );
                        expect(occurrences).toHaveLength(2);
                    });
                });
            });
        });

        describe('2 nodes/records exists with tree multi attribute', () => {
            const treeMultiAttribute: IAttributeWithRevLink = {
                id: 'tree_attr_multi',
                type: AttributeTypes.TREE,
                linked_tree: treeId,
                multiple_values: true,
            };
            let record1: IRecord;
            let record2: IRecord;
            let record1Value1: ILinkValue;
            let record1Value2: ILinkValue;
            let record2Value1: ILinkValue;
            let record2Value2: ILinkValue;

            beforeAll(async () => {
                record1 = await createRecord({});
                record2 = await createRecord({});
                record1Value1 = await createValue(treeMultiAttribute, record1.id, remoteNode1.id);
                record1Value2 = await createValue(treeMultiAttribute, record1.id, remoteNode3.id);
                record2Value1 = await createValue(treeMultiAttribute, record2.id, remoteNode2.id);
                record2Value2 = await createValue(treeMultiAttribute, record2.id, remoteNode4.id);
            });

            describe('getValuesBatch', () => {
                test('Should return values in array for each record', async () => {
                    const values = await attributeTreeRepo.getValuesBatch({
                        library: libraryId,
                        attribute: treeMultiAttribute,
                        recordIds: [record1.id, record2.id],
                        ctx,
                    });

                    expect(values).toEqual([
                        expect.arrayContaining([record1Value1, record1Value2]),
                        expect.arrayContaining([record2Value1, record2Value2]),
                    ]);
                    expect(values[0]).toHaveLength(2);
                    expect(values[1]).toHaveLength(2);
                });

                test('Should return empty array for each not existing record', async () => {
                    const values = await attributeTreeRepo.getValuesBatch({
                        library: libraryId,
                        attribute: treeMultiAttribute,
                        recordIds: [record1.id, record2.id, 'no-exists'],
                        ctx,
                    });

                    expect(values).toEqual([
                        expect.arrayContaining([record1Value1, record1Value2]),
                        expect.arrayContaining([record2Value1, record2Value2]),
                        [],
                    ]);
                    expect(values[0]).toHaveLength(2);
                    expect(values[1]).toHaveLength(2);
                });

                test('Should return empty array for each record without attribute', async () => {
                    const record3WithoutAttr = await recordRepo.createRecord({
                        libraryId,
                        recordData: {},
                        ctx,
                    });

                    const values = await attributeTreeRepo.getValuesBatch({
                        library: libraryId,
                        attribute: treeMultiAttribute,
                        recordIds: [record1.id, record2.id, record3WithoutAttr.id],
                        ctx,
                    });

                    expect(values).toEqual([
                        expect.arrayContaining([record1Value1, record1Value2]),
                        expect.arrayContaining([record2Value1, record2Value2]),
                        [],
                    ]);
                    expect(values[0]).toHaveLength(2);
                    expect(values[1]).toHaveLength(2);
                });
            });

            describe('getValues', () => {
                test('Should return values for a record', async () => {
                    const values = await attributeTreeRepo.getValues({
                        library: libraryId,
                        attribute: treeMultiAttribute,
                        recordId: record1.id,
                        ctx,
                    });

                    expect(values).toEqual(expect.arrayContaining([record1Value1, record1Value2]));
                    expect(values).toHaveLength(2);
                });

                test('Should return empty array not existing record', async () => {
                    const values = await attributeTreeRepo.getValues({
                        library: libraryId,
                        attribute: treeMultiAttribute,
                        recordId: 'no-exists',
                        ctx,
                    });

                    expect(values).toEqual([]);
                });

                test('Should return empty array record without attribute', async () => {
                    const record3WithoutAttr = await createRecord({});

                    const values = await attributeTreeRepo.getValues({
                        library: libraryId,
                        attribute: treeMultiAttribute,
                        recordId: record3WithoutAttr.id,
                        ctx,
                    });

                    expect(values).toEqual([]);
                });
            });

            describe('countValuesOccurrences', () => {
                test('Should throw no supported multi value tree attribute', async () => {
                    await expect(
                        attributeTreeRepo.countValuesOccurrences({
                            library: libraryId,
                            attribute: treeMultiAttribute,
                            recordIds: [record1.id, record2.id],
                            ctx,
                        }),
                    ).rejects.toThrow(/is not supported for multiple values tree attributes/);
                });
            });

            describe('add version values', () => {
                const version1: IValueVersion = {
                    version1: 'node1',
                };
                let record1ValueV1: ILinkValue;
                let record2ValueV1: ILinkValue;
                beforeAll(async () => {
                    record1ValueV1 = await createValue(treeMultiAttribute, record1.id, remoteNode5.id, version1);
                    record2ValueV1 = await createValue(treeMultiAttribute, record2.id, remoteNode6.id, version1);

                    expect(record1ValueV1).toMatchObject({
                        version: version1,
                    });
                    expect(record2ValueV1).toMatchObject({
                        version: version1,
                    });
                });

                describe('getValuesBatch', () => {
                    test('Should return values in array for each record for null version', async () => {
                        const values = await attributeTreeRepo.getValuesBatch({
                            library: libraryId,
                            attribute: treeMultiAttribute,
                            recordIds: [record1.id, record2.id],
                            options: {version: null},
                            ctx,
                        });

                        expect(values).toEqual([
                            expect.arrayContaining([record1Value1, record1Value2]),
                            expect.arrayContaining([record2Value1, record2Value2]),
                        ]);

                        expect(values[0]).toHaveLength(2);
                        expect(values[1]).toHaveLength(2);
                    });

                    test('Should return values in array for each record for a specified version', async () => {
                        const values = await attributeTreeRepo.getValuesBatch({
                            library: libraryId,
                            attribute: treeMultiAttribute,
                            recordIds: [record1.id, record2.id],
                            options: {version: version1},
                            ctx,
                        });

                        expect(values).toEqual([[record1ValueV1], [record2ValueV1]]);
                    });

                    test('Should return all values in array for each record when use forceGetAllValues option', async () => {
                        const values = await attributeTreeRepo.getValuesBatch({
                            library: libraryId,
                            attribute: treeMultiAttribute,
                            recordIds: [record1.id, record2.id],
                            options: {forceGetAllValues: true},
                            ctx,
                        });

                        expect(values).toEqual([
                            expect.arrayContaining([record1Value1, record1Value2, record1ValueV1]),
                            expect.arrayContaining([record2Value1, record2Value2, record2ValueV1]),
                        ]);
                        expect(values[0]).toHaveLength(3);
                        expect(values[1]).toHaveLength(3);
                    });
                });

                describe('getValues', () => {
                    test('Should return values of a record for null version', async () => {
                        const values = await attributeTreeRepo.getValues({
                            library: libraryId,
                            attribute: treeMultiAttribute,
                            recordId: record1.id,
                            options: {version: null},
                            ctx,
                        });

                        expect(values).toEqual(expect.arrayContaining([record1Value1, record1Value2]));
                        expect(values).toHaveLength(2);
                    });

                    test('Should return values of a record for a specified version', async () => {
                        const values = await attributeTreeRepo.getValues({
                            library: libraryId,
                            attribute: treeMultiAttribute,
                            recordId: record1.id,
                            options: {version: version1},
                            ctx,
                        });

                        expect(values).toEqual([record1ValueV1]);
                    });

                    test('Should return all values of a record when use forceGetAllValues option', async () => {
                        const values = await attributeTreeRepo.getValues({
                            library: libraryId,
                            attribute: treeMultiAttribute,
                            recordId: record1.id,
                            forceGetAllValues: true,
                            ctx,
                        });

                        expect(values).toEqual(expect.arrayContaining([record1Value1, record1Value2, record1ValueV1]));
                        expect(values).toHaveLength(3);
                    });
                });
            });
        });
    });
});
