import {AttributeTypes} from '../../../_types/attribute';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IAttributeWithRevLink} from '../../../infra/attributeTypes/attributeTypesRepo';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type ILibraryRepo} from '../../../infra/library/libraryRepo';
import {type IRecord} from '../../../_types/record';
import {getCoreDep, getLibraryRepo, getRecordRepo} from './integrationTestRepoUtils';
import {type IAttributeSimpleLinkRepo} from '../../../infra/attributeTypes/attributeSimpleLinkRepo';
import {type ILinkValue} from '../../../_types/value';

// Very partial tests, to be completed !
// TODO - createValue
// TODO - updateValue
// TODO - deleteValue
// TODO - isValueUsed
// TODO - getValueById
// TODO - clearAllValues
// Maybe - filterValueQueryPart (tested with recordRepo.find ?)
// Maybe - sortQueryPart (tested with recordRepo.find ?)
describe('attributeSimpleLinkRepo', () => {
    let recordRepo: IRecordRepo;
    let libraryRepo: ILibraryRepo;
    let attributeSimpleLinkRepo: IAttributeSimpleLinkRepo;

    const libraryId = 'test_lib_attribute_simple_link_repo';
    const remoteLibraryId = 'test_lib_attribute_remote_simple_link_repo';
    const ctx: IQueryInfos = {
        userId: '1',
    };

    beforeAll(async () => {
        libraryRepo = getLibraryRepo();
        recordRepo = getRecordRepo();
        attributeSimpleLinkRepo = getCoreDep<IAttributeSimpleLinkRepo>('core.infra.attributeTypes.attributeSimpleLink');

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
    ): Promise<ILinkValue> =>
        attributeSimpleLinkRepo.createValue({
            library: libraryId,
            attribute,
            recordId,
            value: {
                payload,
            },
            ctx,
        });

    describe('2 remote records exists,', () => {
        let remoteRecord1: IRecord;
        let remoteRecord2: IRecord;

        beforeAll(async () => {
            [remoteRecord1, remoteRecord2] = await Promise.all(
                Array.from({length: 2}).map((_, index) =>
                    createRemoteRecord({
                        [`attr_data_${index + 1}`]: index + 1,
                    }),
                ),
            );
        });

        describe('2 records exists with simple link', () => {
            const simpleLinkAttribute: IAttributeWithRevLink = {
                id: 'simple_link_attr',
                type: AttributeTypes.SIMPLE_LINK,
                linked_library: remoteLibraryId,
            };

            let record1: IRecord;
            let record2: IRecord;
            let record1Value: ILinkValue;
            let record2Value: ILinkValue;

            beforeAll(async () => {
                record1 = await createRecord({});
                record2 = await createRecord({});
                record1Value = await createValue(simpleLinkAttribute, record1.id, remoteRecord1.id);
                record2Value = await createValue(simpleLinkAttribute, record2.id, remoteRecord2.id);

                expect(record1Value).toMatchObject({
                    id_value: null,
                    payload: remoteRecord1,
                    attribute: simpleLinkAttribute.id,
                    modified_by: null,
                    created_by: null,
                });
                expect(record2Value).toMatchObject({
                    id_value: null,
                    payload: remoteRecord2,
                    attribute: simpleLinkAttribute.id,
                    modified_by: null,
                    created_by: null,
                });
            });

            describe('getValuesBatch', () => {
                test('Should return values in array for each record', async () => {
                    const values = await attributeSimpleLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: simpleLinkAttribute,
                        recordIds: [record1.id, record2.id],
                        ctx,
                    });

                    expect(values).toEqual([[record1Value], [record2Value]]);
                });

                test('Should return empty array for each not existing record', async () => {
                    const values = await attributeSimpleLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: simpleLinkAttribute,
                        recordIds: [record1.id, record2.id, 'no-exists'],
                        ctx,
                    });

                    expect(values).toEqual([[record1Value], [record2Value], []]);
                });

                test('Should return empty array for each record without attribute', async () => {
                    const record3WithoutAttr = await createRecord({});

                    const values = await attributeSimpleLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: simpleLinkAttribute,
                        recordIds: [record1.id, record2.id, record3WithoutAttr.id],
                        ctx,
                    });

                    expect(values).toEqual([[record1Value], [record2Value], []]);
                });
            });

            describe('listDistinctValues', () => {
                let record3WithoutAttr: IRecord;
                let record4WithoutAttr: IRecord;
                let recordWithLink1: IRecord;

                beforeAll(async () => {
                    record3WithoutAttr = await createRecord({});
                    record4WithoutAttr = await createRecord({});
                    recordWithLink1 = await createRecord({});
                    await createValue(simpleLinkAttribute, recordWithLink1.id, remoteRecord1.id);
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
                        recordId: recordWithLink1.id,
                        ctx,
                    });
                });
                test('Should return values occurrences for an attribute', async () => {
                    const occurrences = await attributeSimpleLinkRepo.listDistinctValues({
                        library: libraryId,
                        attribute: simpleLinkAttribute,
                        recordIds: [record1.id, record2.id, recordWithLink1.id],
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
                    const occurrences = await attributeSimpleLinkRepo.listDistinctValues({
                        library: libraryId,
                        attribute: simpleLinkAttribute,
                        recordIds: [
                            record1.id,
                            record2.id,
                            record3WithoutAttr.id,
                            record4WithoutAttr.id,
                            recordWithLink1.id,
                        ],
                        ctx,
                    });

                    expect(occurrences).toHaveLength(3);
                    expect(occurrences).toEqual(
                        expect.arrayContaining([
                            {value: {id: remoteRecord1.id, library: remoteRecord1.library}, count: 2},
                            {value: {id: remoteRecord2.id, library: remoteRecord2.library}, count: 1},
                            {value: null, count: 2},
                        ]),
                    );
                });
            });

            describe('deleteAllLinkValueTo', () => {
                let remoteRecord3: IRecord;
                let record3: IRecord;
                let record4: IRecord;
                beforeAll(async () => {
                    remoteRecord3 = await createRemoteRecord({});
                    record3 = await createRecord({});
                    record4 = await createRecord({});
                });

                test('Should delete all values for a linked record', async () => {
                    await attributeSimpleLinkRepo.deleteAllLinkValueTo(
                        libraryId,
                        simpleLinkAttribute,
                        remoteRecord3.id,
                        ctx,
                    );

                    const valuesAfterDeleteLink = await attributeSimpleLinkRepo.getValuesBatch({
                        library: libraryId,
                        attribute: simpleLinkAttribute,
                        recordIds: [record1.id, record2.id, record3.id, record4.id],
                        ctx,
                    });

                    expect(valuesAfterDeleteLink).toEqual([[record1Value], [record2Value], [], []]);
                });
            });

            describe('deleteValue', () => {
                test('Should return the deleted value', async () => {
                    const value = await attributeSimpleLinkRepo.deleteValue({
                        library: libraryId,
                        attribute: simpleLinkAttribute,
                        recordId: record1.id,
                        value: {payload: record1Value.payload},
                        ctx,
                    });

                    expect(value).toEqual({
                        attribute: simpleLinkAttribute.id,
                        created_by: null,
                        modified_by: null,
                        payload: {
                            id: remoteRecord1.id,
                            library: remoteRecord1.library,
                        },
                    });
                });
            });
        });
    });
});
