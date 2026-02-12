// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeTypes} from '../../../_types/attribute';
import {type IQueryInfos} from '_types/queryInfos';
import {type IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
import {type IRecordRepo} from 'infra/record/recordRepo';
import {type ILibraryRepo} from 'infra/library/libraryRepo';
import {type IRecord} from '_types/record';
import {getCoreDep, getLibraryRepo, getRecordRepo} from './integrationTestRepoUtils';
import {type ILinkValue, type IValueVersion} from '_types/value';
import {type IAttributeAdvancedLinkRepo} from 'infra/attributeTypes/attributeAdvancedLinkRepo';

// Very partial tests, to be completed !
// TODO - createValue
// TODO - updateValue
// TODO - deleteValue
// TODO - isValueUsed
// TODO - getValueById
// TODO - clearAllValues
// Maybe - filterValueQueryPart (tested with recordRepo.find ?)
// Maybe - sortQueryPart (tested with recordRepo.find ?)
describe('attributeAdvancedLinkRepo', () => {
    let recordRepo: IRecordRepo;
    let libraryRepo: ILibraryRepo;
    let attributeAdvancedLinkRepo: IAttributeAdvancedLinkRepo;

    const libraryId = 'test_lib_attribute_advanced_link_repo';
    const remoteLibraryId = 'test_lib_attribute_remote_advanced_link_repo';
    const ctx: IQueryInfos = {
        userId: '1',
    };

    beforeAll(async () => {
        libraryRepo = getLibraryRepo();
        recordRepo = getRecordRepo();
        attributeAdvancedLinkRepo = getCoreDep<IAttributeAdvancedLinkRepo>(
            'core.infra.attributeTypes.attributeAdvancedLink',
        );

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
    ): Promise<ILinkValue> =>
        attributeAdvancedLinkRepo.createValue({
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

    describe('6 remote records exists,', () => {
        let remoteRecord1: IRecord;
        let remoteRecord2: IRecord;
        let remoteRecord3: IRecord;
        let remoteRecord4: IRecord;
        let remoteRecord5: IRecord;
        let remoteRecord6: IRecord;

        beforeAll(async () => {
            [remoteRecord1, remoteRecord2, remoteRecord3, remoteRecord4, remoteRecord5, remoteRecord6] =
                await Promise.all(
                    Array.from({length: 6}).map((_, index) =>
                        createRemoteRecord({
                            [`attr_data_${index + 1}`]: index + 1,
                        }),
                    ),
                );
        });

        describe('2 records exists with advanced link mono attribute', () => {
            const advancedLinkMonoAttribute: IAttributeWithRevLink = {
                id: 'link_attr_mono',
                type: AttributeTypes.ADVANCED_LINK,
                linked_library: remoteLibraryId,
                multiple_values: false,
            };

            let record1: IRecord;
            let record2: IRecord;
            let record1Value: ILinkValue;
            let record2Value: ILinkValue;

            beforeAll(async () => {
                record1 = await createRecord({});
                record2 = await createRecord({});
                record1Value = await createValue(advancedLinkMonoAttribute, record1.id, remoteRecord1.id);
                record2Value = await createValue(advancedLinkMonoAttribute, record2.id, remoteRecord2.id);

                expect(record1Value).toMatchObject({
                    id_value: expect.any(String),
                    payload: remoteRecord1,
                    attribute: advancedLinkMonoAttribute.id,
                    modified_by: ctx.userId,
                    created_by: ctx.userId,
                    version: null,
                });
                expect(record2Value).toMatchObject({
                    id_value: expect.any(String),
                    payload: remoteRecord2,
                    attribute: advancedLinkMonoAttribute.id,
                    modified_by: ctx.userId,
                    created_by: ctx.userId,
                    version: null,
                });
            });

            describe('getValuesBatch', () => {
                test('Should return values in array for each record', async () => {
                    const values = await attributeAdvancedLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedLinkMonoAttribute,
                        recordIds: [record1.id, record2.id],
                        ctx,
                    });

                    expect(values).toEqual([[record1Value], [record2Value]]);
                });

                test('Should return empty array for each not existing record', async () => {
                    const values = await attributeAdvancedLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedLinkMonoAttribute,
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

                    const values = await attributeAdvancedLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedLinkMonoAttribute,
                        recordIds: [record1.id, record2.id, record3WithoutAttr.id],
                        ctx,
                    });

                    expect(values).toEqual([[record1Value], [record2Value], []]);
                });
            });

            describe('getValues', () => {
                test('Should return values for a record', async () => {
                    const values = await attributeAdvancedLinkRepo.getValues({
                        library: libraryId,
                        attribute: advancedLinkMonoAttribute,
                        recordId: record1.id,
                        ctx,
                    });

                    expect(values).toEqual([record1Value]);
                });

                test('Should return empty array not existing record', async () => {
                    const values = await attributeAdvancedLinkRepo.getValues({
                        library: libraryId,
                        attribute: advancedLinkMonoAttribute,
                        recordId: 'no-exists',
                        ctx,
                    });

                    expect(values).toEqual([]);
                });

                test('Should return empty array record without attribute', async () => {
                    const record3WithoutAttr = await createRecord({});

                    const values = await attributeAdvancedLinkRepo.getValues({
                        library: libraryId,
                        attribute: advancedLinkMonoAttribute,
                        recordId: record3WithoutAttr.id,
                        ctx,
                    });

                    expect(values).toEqual([]);
                });
            });

            describe('countValuesOccurrences', () => {
                let record3WithoutAttr: IRecord;
                let record4WithLink1: IRecord;
                beforeAll(async () => {
                    record3WithoutAttr = await createRecord({});
                    record4WithLink1 = await createRecord({});
                    await createValue(advancedLinkMonoAttribute, record4WithLink1.id, remoteRecord1.id);
                });

                afterAll(async () => {
                    // Cleanup
                    await recordRepo.deleteRecord({
                        libraryId,
                        recordId: record3WithoutAttr.id,
                        ctx,
                    });
                    await recordRepo.deleteRecord({
                        libraryId,
                        recordId: record4WithLink1.id,
                        ctx,
                    });
                });

                test('Should return values occurrences for an attribute', async () => {
                    const occurrences = await attributeAdvancedLinkRepo.countValuesOccurrences({
                        library: libraryId,
                        attribute: advancedLinkMonoAttribute,
                        recordIds: [record1.id, record2.id, record4WithLink1.id],
                        ctx,
                    });

                    expect(occurrences).toHaveLength(2);
                    expect(occurrences).toEqual(
                        expect.arrayContaining([
                            {value: {id: remoteRecord1.id, library: remoteRecord1.library}, count: 2},
                            {value: {id: remoteRecord2.id, library: remoteRecord2.library}, count: 1},
                        ]),
                    );
                });

                test('Should return null values occurrences for an attribute', async () => {
                    const occurrences = await attributeAdvancedLinkRepo.countValuesOccurrences({
                        library: libraryId,
                        attribute: advancedLinkMonoAttribute,
                        recordIds: [record1.id, record2.id, record3WithoutAttr.id, record4WithLink1.id],
                        ctx,
                    });

                    expect(occurrences).toHaveLength(3);
                    expect(occurrences).toEqual(
                        expect.arrayContaining([
                            {value: {id: remoteRecord1.id, library: remoteRecord1.library}, count: 2},
                            {value: {id: remoteRecord2.id, library: remoteRecord2.library}, count: 1},
                            {value: null, count: 1},
                        ]),
                    );
                });
            });

            describe('add version values', () => {
                const version1: IValueVersion = {
                    version1: 'node1',
                };
                let record1ValueV1: ILinkValue;
                let record2ValueV1: ILinkValue;
                beforeAll(async () => {
                    record1ValueV1 = await createValue(
                        advancedLinkMonoAttribute,
                        record1.id,
                        remoteRecord3.id,
                        version1,
                    );
                    record2ValueV1 = await createValue(
                        advancedLinkMonoAttribute,
                        record2.id,
                        remoteRecord4.id,
                        version1,
                    );

                    expect(record1ValueV1).toMatchObject({
                        version: version1,
                    });
                    expect(record2ValueV1).toMatchObject({
                        version: version1,
                    });
                });

                describe('getValuesBatch', () => {
                    test('Should return values in array for each record for null version', async () => {
                        const values = await attributeAdvancedLinkRepo.getValuesBatch({
                            library: libraryId,
                            attribute: advancedLinkMonoAttribute,
                            recordIds: [record1.id, record2.id],
                            options: {version: null},
                            ctx,
                        });

                        expect(values).toEqual([[record1Value], [record2Value]]);
                    });

                    test('Should return values in array for each record for a specified version', async () => {
                        const values = await attributeAdvancedLinkRepo.getValuesBatch({
                            library: libraryId,
                            attribute: advancedLinkMonoAttribute,
                            recordIds: [record1.id, record2.id],
                            options: {version: version1},
                            ctx,
                        });

                        expect(values).toEqual([[record1ValueV1], [record2ValueV1]]);
                    });

                    test('Should return all values in array for each record when use forceGetAllValues option', async () => {
                        const values = await attributeAdvancedLinkRepo.getValuesBatch({
                            library: libraryId,
                            attribute: advancedLinkMonoAttribute,
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
                        const values = await attributeAdvancedLinkRepo.getValues({
                            library: libraryId,
                            attribute: advancedLinkMonoAttribute,
                            recordId: record1.id,
                            options: {version: null},
                            ctx,
                        });

                        expect(values).toEqual([record1Value]);
                    });

                    test('Should return values of a record for a specified version', async () => {
                        const values = await attributeAdvancedLinkRepo.getValues({
                            library: libraryId,
                            attribute: advancedLinkMonoAttribute,
                            recordId: record1.id,
                            options: {version: version1},
                            ctx,
                        });

                        expect(values).toEqual([record1ValueV1]);
                    });

                    test('Should return all values of a record when use forceGetAllValues option', async () => {
                        const values = await attributeAdvancedLinkRepo.getValues({
                            library: libraryId,
                            attribute: advancedLinkMonoAttribute,
                            recordId: record1.id,
                            forceGetAllValues: true,
                            ctx,
                        });

                        expect(values).toEqual(expect.arrayContaining([record1Value, record1ValueV1]));
                        expect(values).toHaveLength(2);
                    });
                });

                describe('countValuesOccurrences', () => {
                    let record3WithoutAttr: IRecord;
                    let record4WithLink1: IRecord;
                    beforeAll(async () => {
                        record3WithoutAttr = await createRecord({});
                        record4WithLink1 = await createRecord({});
                        await createValue(advancedLinkMonoAttribute, record4WithLink1.id, remoteRecord3.id, version1);
                    });

                    afterAll(async () => {
                        await recordRepo.deleteRecord({
                            libraryId,
                            recordId: record3WithoutAttr.id,
                            ctx,
                        });
                        await recordRepo.deleteRecord({
                            libraryId,
                            recordId: record4WithLink1.id,
                            ctx,
                        });
                    });

                    test('Should return values occurrences for null version', async () => {
                        const occurrences = await attributeAdvancedLinkRepo.countValuesOccurrences({
                            library: libraryId,
                            attribute: advancedLinkMonoAttribute,
                            recordIds: [record1.id, record2.id, record3WithoutAttr.id, record4WithLink1.id],
                            options: {version: null},
                            ctx,
                        });

                        expect(occurrences).toHaveLength(3);
                        expect(occurrences).toEqual(
                            expect.arrayContaining([
                                {value: {id: remoteRecord1.id, library: remoteRecord1.library}, count: 1},
                                {value: {id: remoteRecord2.id, library: remoteRecord2.library}, count: 1},
                                {value: null, count: 2},
                            ]),
                        );
                    });

                    test('Should return values occurrences for null version', async () => {
                        const occurrences = await attributeAdvancedLinkRepo.countValuesOccurrences({
                            library: libraryId,
                            attribute: advancedLinkMonoAttribute,
                            recordIds: [record1.id, record2.id, record3WithoutAttr.id, record4WithLink1.id],
                            options: {version: version1},
                            ctx,
                        });

                        expect(occurrences).toHaveLength(3);
                        expect(occurrences).toEqual(
                            expect.arrayContaining([
                                {value: {id: remoteRecord3.id, library: remoteRecord3.library}, count: 2},
                                {value: {id: remoteRecord4.id, library: remoteRecord4.library}, count: 1},
                                {value: null, count: 1},
                            ]),
                        );
                    });
                });
            });
        });

        describe('2 records exists with advanced link multi attribute', () => {
            const advancedLinkMultiAttribute: IAttributeWithRevLink = {
                id: 'link_attr_multi',
                type: AttributeTypes.ADVANCED_LINK,
                linked_library: remoteLibraryId,
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
                record1Value1 = await createValue(advancedLinkMultiAttribute, record1.id, remoteRecord1.id);
                record1Value2 = await createValue(advancedLinkMultiAttribute, record1.id, remoteRecord3.id);
                record2Value1 = await createValue(advancedLinkMultiAttribute, record2.id, remoteRecord2.id);
                record2Value2 = await createValue(advancedLinkMultiAttribute, record2.id, remoteRecord4.id);
            });

            describe('getValuesBatch', () => {
                test('Should return values in array for each record', async () => {
                    const values = await attributeAdvancedLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedLinkMultiAttribute,
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
                    const values = await attributeAdvancedLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedLinkMultiAttribute,
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

                    const values = await attributeAdvancedLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedLinkMultiAttribute,
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
                    const values = await attributeAdvancedLinkRepo.getValues({
                        library: libraryId,
                        attribute: advancedLinkMultiAttribute,
                        recordId: record1.id,
                        ctx,
                    });

                    expect(values).toEqual(expect.arrayContaining([record1Value1, record1Value2]));
                    expect(values).toHaveLength(2);
                });

                test('Should return empty array not existing record', async () => {
                    const values = await attributeAdvancedLinkRepo.getValues({
                        library: libraryId,
                        attribute: advancedLinkMultiAttribute,
                        recordId: 'no-exists',
                        ctx,
                    });

                    expect(values).toEqual([]);
                });

                test('Should return empty array record without attribute', async () => {
                    const record3WithoutAttr = await createRecord({});

                    const values = await attributeAdvancedLinkRepo.getValues({
                        library: libraryId,
                        attribute: advancedLinkMultiAttribute,
                        recordId: record3WithoutAttr.id,
                        ctx,
                    });

                    expect(values).toEqual([]);
                });
            });

            describe('countValuesOccurrences', () => {
                let record3WithoutAttr: IRecord;
                let record4WithoutAttr: IRecord;
                let recordWithManyLink: IRecord;
                beforeAll(async () => {
                    record3WithoutAttr = await createRecord({});
                    record4WithoutAttr = await createRecord({});
                    recordWithManyLink = await createRecord({});
                    await createValue(advancedLinkMultiAttribute, recordWithManyLink.id, remoteRecord1.id);
                    await createValue(advancedLinkMultiAttribute, recordWithManyLink.id, remoteRecord3.id);
                });

                afterAll(async () => {
                    await recordRepo.deleteRecord({
                        libraryId,
                        recordId: record3WithoutAttr.id,
                        ctx,
                    });
                    await recordRepo.deleteRecord({
                        libraryId,
                        recordId: record4WithoutAttr.id,
                        ctx,
                    });
                    await recordRepo.deleteRecord({
                        libraryId,
                        recordId: recordWithManyLink.id,
                        ctx,
                    });
                });

                test('Should return values occurrences for an attribute', async () => {
                    const occurrences = await attributeAdvancedLinkRepo.countValuesOccurrences({
                        library: libraryId,
                        attribute: advancedLinkMultiAttribute,
                        recordIds: [record1.id, record2.id, recordWithManyLink.id],
                        ctx,
                    });

                    expect(occurrences).toHaveLength(4);
                    expect(occurrences).toEqual(
                        expect.arrayContaining([
                            {value: {id: remoteRecord1.id, library: remoteRecord1.library}, count: 2},
                            {value: {id: remoteRecord2.id, library: remoteRecord2.library}, count: 1},
                            {value: {id: remoteRecord3.id, library: remoteRecord3.library}, count: 2},
                            {value: {id: remoteRecord4.id, library: remoteRecord4.library}, count: 1},
                        ]),
                    );
                });

                test('Should return null values occurrences for an attribute', async () => {
                    const occurrences = await attributeAdvancedLinkRepo.countValuesOccurrences({
                        library: libraryId,
                        attribute: advancedLinkMultiAttribute,
                        recordIds: [
                            record1.id,
                            record2.id,
                            record3WithoutAttr.id,
                            record4WithoutAttr.id,
                            recordWithManyLink.id,
                        ],
                        ctx,
                    });

                    expect(occurrences).toHaveLength(5);
                    expect(occurrences).toEqual(
                        expect.arrayContaining([
                            {value: {id: remoteRecord1.id, library: remoteRecord1.library}, count: 2},
                            {value: {id: remoteRecord2.id, library: remoteRecord2.library}, count: 1},
                            {value: {id: remoteRecord3.id, library: remoteRecord3.library}, count: 2},
                            {value: {id: remoteRecord4.id, library: remoteRecord4.library}, count: 1},
                            {value: null, count: 2},
                        ]),
                    );
                });
            });

            describe('add version values', () => {
                const version1: IValueVersion = {
                    version1: 'node1',
                };
                let record1ValueV1: ILinkValue;
                let record2ValueV1: ILinkValue;
                beforeAll(async () => {
                    record1ValueV1 = await createValue(
                        advancedLinkMultiAttribute,
                        record1.id,
                        remoteRecord5.id,
                        version1,
                    );
                    record2ValueV1 = await createValue(
                        advancedLinkMultiAttribute,
                        record2.id,
                        remoteRecord6.id,
                        version1,
                    );

                    expect(record1ValueV1).toMatchObject({
                        version: version1,
                    });
                    expect(record2ValueV1).toMatchObject({
                        version: version1,
                    });
                });

                describe('getValuesBatch', () => {
                    test('Should return values in array for each record for null version', async () => {
                        const values = await attributeAdvancedLinkRepo.getValuesBatch({
                            library: libraryId,
                            attribute: advancedLinkMultiAttribute,
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
                        const values = await attributeAdvancedLinkRepo.getValuesBatch({
                            library: libraryId,
                            attribute: advancedLinkMultiAttribute,
                            recordIds: [record1.id, record2.id],
                            options: {version: version1},
                            ctx,
                        });

                        expect(values).toEqual([[record1ValueV1], [record2ValueV1]]);
                    });

                    test('Should return all values in array for each record when use forceGetAllValues option', async () => {
                        const values = await attributeAdvancedLinkRepo.getValuesBatch({
                            library: libraryId,
                            attribute: advancedLinkMultiAttribute,
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
                        const values = await attributeAdvancedLinkRepo.getValues({
                            library: libraryId,
                            attribute: advancedLinkMultiAttribute,
                            recordId: record1.id,
                            options: {version: null},
                            ctx,
                        });

                        expect(values).toEqual(expect.arrayContaining([record1Value1, record1Value2]));
                        expect(values).toHaveLength(2);
                    });

                    test('Should return values of a record for a specified version', async () => {
                        const values = await attributeAdvancedLinkRepo.getValues({
                            library: libraryId,
                            attribute: advancedLinkMultiAttribute,
                            recordId: record1.id,
                            options: {version: version1},
                            ctx,
                        });

                        expect(values).toEqual([record1ValueV1]);
                    });

                    test('Should return all values of a record when use forceGetAllValues option', async () => {
                        const values = await attributeAdvancedLinkRepo.getValues({
                            library: libraryId,
                            attribute: advancedLinkMultiAttribute,
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

        describe('2 records exists with reverse simple link attribute', () => {
            const simpleLinkAttribute: IAttributeWithRevLink = {
                id: 'simple_link_attr',
                type: AttributeTypes.SIMPLE_LINK,
                linked_library: libraryId,
            };
            const advancedLinkReverseAttribute: IAttributeWithRevLink = {
                id: 'link_attr_multi_reverse',
                type: AttributeTypes.ADVANCED_LINK,
                linked_library: remoteLibraryId,
                multiple_values: true,
                reverse_link: simpleLinkAttribute,
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
                record1Value1 = await createValue(advancedLinkReverseAttribute, record1.id, remoteRecord1.id);
                record1Value2 = await createValue(advancedLinkReverseAttribute, record1.id, remoteRecord3.id);
                record2Value1 = await createValue(advancedLinkReverseAttribute, record2.id, remoteRecord2.id);
                record2Value2 = await createValue(advancedLinkReverseAttribute, record2.id, remoteRecord4.id);

                const remoteRecord = await recordRepo.getRecord({
                    libraryId: remoteLibraryId,
                    recordId: remoteRecord1.id,
                    ctx,
                });

                expect(remoteRecord).toMatchObject({
                    id: remoteRecord1.id,
                    library: remoteLibraryId,
                    [simpleLinkAttribute.id]: record1.id,
                    attr_data_1: 1,
                });

                expect(record1Value1).toMatchObject({
                    id_value: remoteRecord1.id, // id_value is the id of the remote record in case of reverse simple link
                    payload: {
                        id: remoteRecord1.id,
                        library: remoteLibraryId,
                    },
                    modified_by: null,
                    created_by: null,
                });

                // Hack, createValue with to reverse simple link does not return the full record in payload.
                [record1Value1, record2Value1, record1Value2, record2Value2] = await Promise.all(
                    [record1Value1, record2Value1, record1Value2, record2Value2].map(async recordVal => ({
                        ...recordVal,
                        payload: await recordRepo.getRecord({
                            libraryId: remoteLibraryId,
                            recordId: recordVal.payload.id,
                            ctx,
                        }),
                    })),
                );
            });

            describe('getValuesBatch', () => {
                test('Should return values in array for each record', async () => {
                    const values = await attributeAdvancedLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedLinkReverseAttribute,
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
                    const values = await attributeAdvancedLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedLinkReverseAttribute,
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

                    const values = await attributeAdvancedLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedLinkReverseAttribute,
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
                    const values = await attributeAdvancedLinkRepo.getValues({
                        library: libraryId,
                        attribute: advancedLinkReverseAttribute,
                        recordId: record1.id,
                        ctx,
                    });

                    expect(values).toEqual(expect.arrayContaining([record1Value1, record1Value2]));
                    expect(values).toHaveLength(2);
                });

                test('Should return empty array not existing record', async () => {
                    const values = await attributeAdvancedLinkRepo.getValues({
                        library: libraryId,
                        attribute: advancedLinkReverseAttribute,
                        recordId: 'no-exists',
                        ctx,
                    });

                    expect(values).toEqual([]);
                });

                test('Should return empty array record without attribute', async () => {
                    const record3WithoutAttr = await createRecord({});

                    const values = await attributeAdvancedLinkRepo.getValues({
                        library: libraryId,
                        attribute: advancedLinkReverseAttribute,
                        recordId: record3WithoutAttr.id,
                        ctx,
                    });

                    expect(values).toEqual([]);
                });
            });

            describe('countValuesOccurrences', () => {
                let record3WithoutAttr: IRecord;
                let record4WithoutAttr: IRecord;
                beforeAll(async () => {
                    record3WithoutAttr = await createRecord({});
                    record4WithoutAttr = await createRecord({});
                });

                afterAll(async () => {
                    await recordRepo.deleteRecord({
                        libraryId,
                        recordId: record3WithoutAttr.id,
                        ctx,
                    });
                    await recordRepo.deleteRecord({
                        libraryId,
                        recordId: record4WithoutAttr.id,
                        ctx,
                    });
                });

                test('Should return values occurrences for an attribute', async () => {
                    const occurrences = await attributeAdvancedLinkRepo.countValuesOccurrences({
                        library: libraryId,
                        attribute: advancedLinkReverseAttribute,
                        recordIds: [record1.id, record2.id],
                        ctx,
                    });

                    expect(occurrences).toHaveLength(4);
                    expect(occurrences).toEqual(
                        expect.arrayContaining([
                            {value: {id: remoteRecord1.id, library: remoteRecord1.library}, count: 1},
                            {value: {id: remoteRecord2.id, library: remoteRecord2.library}, count: 1},
                            {value: {id: remoteRecord3.id, library: remoteRecord3.library}, count: 1},
                            {value: {id: remoteRecord4.id, library: remoteRecord4.library}, count: 1},
                        ]),
                    );
                });

                test('Should return null values occurrences for an attribute', async () => {
                    const occurrences = await attributeAdvancedLinkRepo.countValuesOccurrences({
                        library: libraryId,
                        attribute: advancedLinkReverseAttribute,
                        recordIds: [record1.id, record2.id, record3WithoutAttr.id, record4WithoutAttr.id],
                        ctx,
                    });

                    expect(occurrences).toHaveLength(5);
                    expect(occurrences).toEqual(
                        expect.arrayContaining([
                            {value: {id: remoteRecord1.id, library: remoteRecord1.library}, count: 1},
                            {value: {id: remoteRecord2.id, library: remoteRecord2.library}, count: 1},
                            {value: {id: remoteRecord3.id, library: remoteRecord3.library}, count: 1},
                            {value: {id: remoteRecord4.id, library: remoteRecord4.library}, count: 1},
                            {value: null, count: 2},
                        ]),
                    );
                });
            });
        });

        describe('clearMultipleValues', () => {
            test('Should remain only the more recent value', async () => {
                // We use a multi-value attribute to no be biased with the getValues function which return
                // only the more recent value if there is some values on a mono attribute.
                const advancedLinkMultiAttribute: IAttributeWithRevLink = {
                    id: 'link_attr_multi',
                    type: AttributeTypes.ADVANCED_LINK,
                    linked_library: remoteLibraryId,
                    multiple_values: true,
                };

                const record = await createRecord({});
                await createValue(advancedLinkMultiAttribute, record.id, remoteRecord1.id);
                const value2 = await createValue(advancedLinkMultiAttribute, record.id, remoteRecord2.id);

                await attributeAdvancedLinkRepo.clearMultipleValues({
                    libraryId,
                    attribute: advancedLinkMultiAttribute,
                    ctx,
                });

                const values = await attributeAdvancedLinkRepo.getValues({
                    library: libraryId,
                    attribute: advancedLinkMultiAttribute,
                    recordId: record.id,
                    ctx,
                });

                expect(values).toEqual([value2]);
            });
        });
    });
});
