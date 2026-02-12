// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {type IQueryInfos} from '_types/queryInfos';
import {type IAttributeAdvancedRepo} from 'infra/attributeTypes/attributeAdvancedRepo';
import {type IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
import {type IRecordRepo} from 'infra/record/recordRepo';
import {type ILibraryRepo} from 'infra/library/libraryRepo';
import {type IRecord} from '_types/record';
import {getCoreDep, getLibraryRepo, getRecordRepo} from './integrationTestRepoUtils';
import {type IStandardValue, type IValueVersion} from '_types/value';

// Very partial tests, to be completed !
// TODO - createValue
// TODO - updateValue
// TODO - deleteValue
// TODO - isValueUsed
// TODO - getValueById
// TODO - clearAllValues
// Maybe - filterValueQueryPart (tested with recordRepo.find ?)
// Maybe - sortQueryPart (tested with recordRepo.find ?)
describe('attributeAdvancedRepo', () => {
    let recordRepo: IRecordRepo;
    let libraryRepo: ILibraryRepo;
    let attributeAdvancedRepo: IAttributeAdvancedRepo;

    const libraryId = 'test_lib_attribute_advanced_repo';
    const ctx: IQueryInfos = {
        userId: '1',
    };

    beforeAll(async () => {
        libraryRepo = getLibraryRepo();
        recordRepo = getRecordRepo();
        attributeAdvancedRepo = getCoreDep<IAttributeAdvancedRepo>('core.infra.attributeTypes.attributeAdvanced');

        await libraryRepo.createLibrary({
            libData: {
                id: libraryId,
            },
            ctx,
        });
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
        payload: any,
        version: IValueVersion | null = null,
    ): Promise<IStandardValue> =>
        attributeAdvancedRepo.createValue({
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

    const advancedTextMonoAttribute: IAttributeWithRevLink = {
        id: 'text_attr_mono',
        type: AttributeTypes.ADVANCED,
        multiple_values: false,
    };

    describe('2 records exists with advanced mono attribute', () => {
        const advancedExtendedAttribute: IAttributeWithRevLink = {
            id: 'extended_attr',
            type: AttributeTypes.ADVANCED,
            multiple_values: true,
            format: AttributeFormats.EXTENDED,
            embedded_fields: [
                {
                    id: 'key1',
                    format: AttributeFormats.EXTENDED,
                    embedded_fields: [
                        {
                            id: 'subkey1',
                            format: AttributeFormats.TEXT,
                        },
                    ],
                },
                {
                    id: 'key2',
                    format: AttributeFormats.TEXT,
                },
            ],
        };

        let record1: IRecord;
        let record2: IRecord;
        let record1Value: IStandardValue;
        let record2Value: IStandardValue;

        beforeAll(async () => {
            record1 = await createRecord({});
            record2 = await createRecord({});
            record1Value = await createValue(advancedTextMonoAttribute, record1.id, 'value1');
            record2Value = await createValue(advancedTextMonoAttribute, record2.id, 'value2');

            expect(record1Value).toMatchObject({
                id_value: expect.any(String),
                payload: 'value1',
                attribute: advancedTextMonoAttribute.id,
                modified_by: ctx.userId,
                created_by: ctx.userId,
                version: null,
            });
            expect(record2Value).toMatchObject({
                id_value: expect.any(String),
                payload: 'value2',
                attribute: advancedTextMonoAttribute.id,
                modified_by: ctx.userId,
                created_by: ctx.userId,
                version: null,
            });
        });

        describe('getValuesBatch', () => {
            test('Should return values in array for each record', async () => {
                const values = await attributeAdvancedRepo.getValuesBatch({
                    library: libraryId,
                    attribute: advancedTextMonoAttribute,
                    recordIds: [record1.id, record2.id],
                    ctx,
                });

                expect(values).toEqual([[record1Value], [record2Value]]);
            });

            test('Should return empty array for each not existing record', async () => {
                const values = await attributeAdvancedRepo.getValuesBatch({
                    library: libraryId,
                    attribute: advancedTextMonoAttribute,
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

                const values = await attributeAdvancedRepo.getValuesBatch({
                    library: libraryId,
                    attribute: advancedTextMonoAttribute,
                    recordIds: [record1.id, record2.id, record3WithoutAttr.id],
                    ctx,
                });

                expect(values).toEqual([[record1Value], [record2Value], []]);
            });

            describe('getValues', () => {
                test('Should return values for a record', async () => {
                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMonoAttribute,
                        recordId: record1.id,
                        ctx,
                    });

                    expect(values).toEqual([record1Value]);
                });

                test('Should return empty array not existing record', async () => {
                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMonoAttribute,
                        recordId: 'no-exists',
                        ctx,
                    });

                    expect(values).toEqual([]);
                });

                test('Should return empty array record without attribute', async () => {
                    const record3WithoutAttr = await createRecord({});

                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMonoAttribute,
                        recordId: record3WithoutAttr.id,
                        ctx,
                    });

                    expect(values).toEqual([]);
                });
            });
        });

        describe('add version values', () => {
            const version1: IValueVersion = {
                version1: 'node1',
            };
            let record1ValueV1: IStandardValue;
            let record2ValueV1: IStandardValue;
            beforeAll(async () => {
                record1ValueV1 = await createValue(advancedTextMonoAttribute, record1.id, 'value1V1', version1);
                record2ValueV1 = await createValue(advancedTextMonoAttribute, record2.id, 'value2V1', version1);

                expect(record1ValueV1).toMatchObject({
                    version: version1,
                });
                expect(record2ValueV1).toMatchObject({
                    version: version1,
                });
            });

            describe('getValuesBatch', () => {
                test('Should return values in array for each record for null version', async () => {
                    const values = await attributeAdvancedRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedTextMonoAttribute,
                        recordIds: [record1.id, record2.id],
                        options: {version: null},
                        ctx,
                    });

                    expect(values).toEqual([[record1Value], [record2Value]]);
                });

                test('Should return values in array for each record for a specified version', async () => {
                    const values = await attributeAdvancedRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedTextMonoAttribute,
                        recordIds: [record1.id, record2.id],
                        options: {version: version1},
                        ctx,
                    });

                    expect(values).toEqual([[record1ValueV1], [record2ValueV1]]);
                });

                test('Should return all values in array for each record when use forceGetAllValues option', async () => {
                    const values = await attributeAdvancedRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedTextMonoAttribute,
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
                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMonoAttribute,
                        recordId: record1.id,
                        options: {version: null},
                        ctx,
                    });

                    expect(values).toEqual([record1Value]);
                });

                test('Should return values of a record for a specified version', async () => {
                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMonoAttribute,
                        recordId: record1.id,
                        options: {version: version1},
                        ctx,
                    });

                    expect(values).toEqual([record1ValueV1]);
                });

                test('Should return all values of a record when use forceGetAllValues option', async () => {
                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMonoAttribute,
                        recordId: record1.id,
                        forceGetAllValues: true,
                        ctx,
                    });

                    expect(values).toEqual(expect.arrayContaining([record1Value, record1ValueV1]));
                    expect(values).toHaveLength(2);
                });
            });
        });
    });

    describe('2 records exists with advanced multi attribute', () => {
        const advancedTextMultiAttribute: IAttributeWithRevLink = {
            id: 'text_attr_multi',
            type: AttributeTypes.ADVANCED,
            multiple_values: true,
        };

        const advancedExtendedAttribute: IAttributeWithRevLink = {
            id: 'extended_attr',
            type: AttributeTypes.ADVANCED,
            format: AttributeFormats.EXTENDED,
            multiple_values: true,
            embedded_fields: [
                {
                    id: 'key1',
                    format: AttributeFormats.EXTENDED,
                    embedded_fields: [
                        {
                            id: 'subkey1',
                            format: AttributeFormats.TEXT,
                        },
                    ],
                },
                {
                    id: 'key2',
                    format: AttributeFormats.TEXT,
                },
            ],
        };

        let record1: IRecord;
        let record2: IRecord;
        let record1Value1: IStandardValue;
        let record1Value2: IStandardValue;
        let record2Value1: IStandardValue;
        let record2Value2: IStandardValue;

        beforeAll(async () => {
            record1 = await createRecord({});
            record2 = await createRecord({});
            record1Value1 = await createValue(advancedTextMultiAttribute, record1.id, 'value1');
            record1Value2 = await createValue(advancedTextMultiAttribute, record1.id, 'value12');
            record2Value1 = await createValue(advancedTextMultiAttribute, record2.id, 'value2');
            record2Value2 = await createValue(advancedTextMultiAttribute, record2.id, 'value22');

            expect(record1Value1).toMatchObject({
                id_value: expect.any(String),
                payload: 'value1',
                attribute: advancedTextMultiAttribute.id,
                modified_by: ctx.userId,
                created_by: ctx.userId,
                version: null,
            });
            expect(record2Value2).toMatchObject({
                id_value: expect.any(String),
                payload: 'value22',
                attribute: advancedTextMultiAttribute.id,
                modified_by: ctx.userId,
                created_by: ctx.userId,
                version: null,
            });
        });

        describe('getValuesBatch', () => {
            test('Should return values in array for each record', async () => {
                const values = await attributeAdvancedRepo.getValuesBatch({
                    library: libraryId,
                    attribute: advancedTextMultiAttribute,
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
                const values = await attributeAdvancedRepo.getValuesBatch({
                    library: libraryId,
                    attribute: advancedTextMultiAttribute,
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

                const values = await attributeAdvancedRepo.getValuesBatch({
                    library: libraryId,
                    attribute: advancedTextMultiAttribute,
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

            describe('getValues', () => {
                test('Should return values for a record', async () => {
                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMultiAttribute,
                        recordId: record1.id,
                        ctx,
                    });

                    expect(values).toEqual(expect.arrayContaining([record1Value1, record1Value2]));
                    expect(values).toHaveLength(2);
                });

                test('Should return empty array not existing record', async () => {
                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMultiAttribute,
                        recordId: 'no-exists',
                        ctx,
                    });

                    expect(values).toEqual([]);
                });

                test('Should return empty array record without attribute', async () => {
                    const record3WithoutAttr = await createRecord({});

                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMultiAttribute,
                        recordId: record3WithoutAttr.id,
                        ctx,
                    });

                    expect(values).toEqual([]);
                });
            });
        });

        describe('add version values', () => {
            const version1: IValueVersion = {
                version1: 'node1',
            };
            let record1ValueV1: IStandardValue;
            let record2ValueV1: IStandardValue;
            beforeAll(async () => {
                record1ValueV1 = await createValue(advancedTextMultiAttribute, record1.id, 'value1V1', version1);
                record2ValueV1 = await createValue(advancedTextMultiAttribute, record2.id, 'value2V2', version1);

                expect(record1ValueV1).toMatchObject({
                    version: version1,
                });
                expect(record2ValueV1).toMatchObject({
                    version: version1,
                });
            });

            describe('getValuesBatch', () => {
                test('Should return values in array for each record for null version', async () => {
                    const values = await attributeAdvancedRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedTextMultiAttribute,
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
                    const values = await attributeAdvancedRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedTextMultiAttribute,
                        recordIds: [record1.id, record2.id],
                        options: {version: version1},
                        ctx,
                    });

                    expect(values).toEqual([[record1ValueV1], [record2ValueV1]]);
                });

                test('Should return all values in array for each record when use forceGetAllValues option', async () => {
                    const values = await attributeAdvancedRepo.getValuesBatch({
                        library: libraryId,
                        attribute: advancedTextMultiAttribute,
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
                test('Should return values for a record for null version', async () => {
                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMultiAttribute,
                        recordId: record1.id,
                        options: {version: null},
                        ctx,
                    });

                    expect(values).toEqual(expect.arrayContaining([record1Value1, record1Value2]));
                    expect(values).toHaveLength(2);
                });

                test('Should return values array record for specified version', async () => {
                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMultiAttribute,
                        recordId: record1.id,
                        options: {version: version1},
                        ctx,
                    });

                    expect(values).toEqual([record1ValueV1]);
                });

                test('Should return all values array record when use forceGetAllValues option', async () => {
                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMultiAttribute,
                        recordId: record1.id,
                        forceGetAllValues: true,
                        ctx,
                    });

                    expect(values).toEqual(expect.arrayContaining([record1Value1, record1Value2, record1ValueV1]));
                    expect(values).toHaveLength(3);
                });
            });

            describe('createValue', () => {
                test('Create extended attribute value', async () => {
                    const recordWithExtendedAttr = await createRecord({});

                    const value = await attributeAdvancedRepo.createValue({
                        library: libraryId,
                        attribute: advancedExtendedAttribute,
                        recordId: recordWithExtendedAttr.id,
                        value: {
                            payload: JSON.stringify({
                                key1: {
                                    subkey1: 'subvalue1',
                                },
                                key2: 'value2',
                            }),
                        },
                        ctx,
                    });

                    expect(value.payload).toEqual(
                        JSON.stringify({
                            key1: {
                                subkey1: 'subvalue1',
                            },
                            key2: 'value2',
                        }),
                    );
                });
            });

            describe('updateValue', () => {
                test('Update extended attribute value (no partial update)', async () => {
                    const recordWithExtendedAttr = await createRecord({});

                    const newValue = await attributeAdvancedRepo.createValue({
                        library: libraryId,
                        attribute: advancedExtendedAttribute,
                        recordId: recordWithExtendedAttr.id,
                        value: {
                            payload: JSON.stringify({
                                key1: {
                                    subkey1: 'subvalue1',
                                },
                                key2: 'value2',
                            }),
                        },
                        ctx,
                    });

                    const value = await attributeAdvancedRepo.updateValue({
                        library: libraryId,
                        attribute: advancedExtendedAttribute,
                        recordId: recordWithExtendedAttr.id,
                        value: {
                            id_value: newValue.id_value,
                            payload: JSON.stringify({
                                key2: 'value2',
                            }),
                        },
                        ctx,
                    });

                    expect(value.id_value).toBe(newValue.id_value);
                    expect(value.payload).toEqual(
                        JSON.stringify({
                            key2: 'value2',
                        }),
                    );
                });
            });

            describe('clearMultipleValues', () => {
                test('Should remain only the more recent value', async () => {
                    const record3 = await createRecord({});

                    // We use a multi-value attribute to no be biased with the getValues function which return
                    // only the more recent value if there is some values on a mono attribute.
                    await createValue(advancedTextMultiAttribute, record3.id, 'value1');
                    const record3Value2 = await createValue(advancedTextMultiAttribute, record3.id, 'value2');

                    await attributeAdvancedRepo.clearMultipleValues({
                        libraryId,
                        attribute: advancedTextMultiAttribute,
                        ctx,
                    });

                    const values = await attributeAdvancedRepo.getValues({
                        library: libraryId,
                        attribute: advancedTextMultiAttribute,
                        recordId: record3.id,
                        ctx,
                    });

                    expect(values).toEqual([record3Value2]);
                });
            });
        });
    });
});
