// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IAttributeSimpleRepo} from '../../../infra/attributeTypes/attributeSimpleRepo';
import {type IAttributeWithRevLink} from '../../../infra/attributeTypes/attributeTypesRepo';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type ILibraryRepo} from '../../../infra/library/libraryRepo';
import {type IRecord} from '../../../_types/record';
import {getCoreDep, getLibraryRepo, getRecordRepo} from './integrationTestRepoUtils';
import {type IStandardValue} from '../../../_types/value';

// Very partial tests, to be completed !
// TODO - createValue
// TODO - updateValue
// TODO - deleteValue
// TODO - isValueUsed
// TODO - getValueById
// TODO - clearAllValues
// Maybe - filterValueQueryPart (tested with recordRepo.find ?)
// Maybe - sortQueryPart (tested with recordRepo.find ?)
describe('attributeSimpleRepo', () => {
    let recordRepo: IRecordRepo;
    let libraryRepo: ILibraryRepo;
    let attributeSimpleRepo: IAttributeSimpleRepo;

    const libraryId = 'test_lib_attribute_simple_repo';
    const ctx: IQueryInfos = {
        userId: '1',
    };

    beforeAll(async () => {
        libraryRepo = getLibraryRepo();
        recordRepo = getRecordRepo();
        attributeSimpleRepo = getCoreDep<IAttributeSimpleRepo>('core.infra.attributeTypes.attributeSimple');

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
    ): Promise<IStandardValue> =>
        attributeSimpleRepo.createValue({
            library: libraryId,
            attribute,
            recordId,
            value: {
                payload,
            },
            ctx,
        });

    describe('2 records exists with simple attribute', () => {
        const simpleTextAttribute: IAttributeWithRevLink = {
            id: 'text_attr',
            type: AttributeTypes.SIMPLE,
        };

        const simpleExtendedAttribute: IAttributeWithRevLink = {
            id: 'extended_attr',
            type: AttributeTypes.SIMPLE,
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
            record1Value = await createValue(simpleTextAttribute, record1.id, 'value1');
            record2Value = await createValue(simpleTextAttribute, record2.id, 'value2');

            expect(record1Value).toMatchObject({
                payload: 'value1',
                attribute: simpleTextAttribute.id,
                modified_by: null,
                created_by: null,
            });
            expect(record2Value).toMatchObject({
                payload: 'value2',
                attribute: simpleTextAttribute.id,
                modified_by: null,
                created_by: null,
            });
        });

        describe('getValuesBatch', () => {
            test('Should return values in array for each record', async () => {
                const values = await attributeSimpleRepo.getValuesBatch({
                    library: libraryId,
                    attribute: simpleTextAttribute,
                    recordIds: [record1.id, record2.id],
                    ctx,
                });

                expect(values).toEqual([[record1Value], [record2Value]]);
            });

            test('Should return empty array for each not existing record', async () => {
                const values = await attributeSimpleRepo.getValuesBatch({
                    library: libraryId,
                    attribute: simpleTextAttribute,
                    recordIds: [record1.id, record2.id, 'no-exists'],
                    ctx,
                });

                expect(values).toEqual([[record1Value], [record2Value], []]);
            });

            test('Should return empty array for each record without attribute', async () => {
                const record3WithoutAttr = await createRecord({});

                const values = await attributeSimpleRepo.getValuesBatch({
                    library: libraryId,
                    attribute: simpleTextAttribute,
                    recordIds: [record1.id, record2.id, record3WithoutAttr.id],
                    ctx,
                });

                expect(values).toEqual([[record1Value], [record2Value], []]);
            });
        });

        describe('getValues', () => {
            test('Should return values for a record', async () => {
                const values = await attributeSimpleRepo.getValues({
                    library: libraryId,
                    attribute: simpleTextAttribute,
                    recordId: record1.id,
                    ctx,
                });

                expect(values).toEqual([record1Value]);
            });

            test('Should return empty array not existing record', async () => {
                const values = await attributeSimpleRepo.getValues({
                    library: libraryId,
                    attribute: simpleTextAttribute,
                    recordId: 'no-exists',
                    ctx,
                });

                expect(values).toEqual([]);
            });

            test('Should return empty array record without attribute', async () => {
                const record3WithoutAttr = await createRecord({});

                const values = await attributeSimpleRepo.getValues({
                    library: libraryId,
                    attribute: simpleTextAttribute,
                    recordId: record3WithoutAttr.id,
                    ctx,
                });

                expect(values).toEqual([]);
            });
        });

        describe('createValue', () => {
            test('Create extended attribute value', async () => {
                const recordWithExtendedAttr = await createRecord({});

                const value = await attributeSimpleRepo.createValue({
                    library: libraryId,
                    attribute: simpleExtendedAttribute,
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

                await attributeSimpleRepo.createValue({
                    library: libraryId,
                    attribute: simpleExtendedAttribute,
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

                const value = await attributeSimpleRepo.updateValue({
                    library: libraryId,
                    attribute: simpleExtendedAttribute,
                    recordId: recordWithExtendedAttr.id,
                    value: {
                        payload: JSON.stringify({
                            key2: 'value2',
                        }),
                    },
                    ctx,
                });

                expect(value.payload).toEqual(
                    JSON.stringify({
                        key2: 'value2',
                    }),
                );
            });
        });

        describe('deleteValue', () => {
            test('Should return the deleted value', async () => {
                const value = await attributeSimpleRepo.deleteValue({
                    library: libraryId,
                    attribute: simpleTextAttribute,
                    recordId: record1.id,
                    value: {payload: record1Value.payload},
                    ctx,
                });

                expect(value).toEqual(record1Value);
            });
        });
    });
});
