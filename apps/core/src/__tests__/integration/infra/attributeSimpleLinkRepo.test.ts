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
import {type IAttributeSimpleLinkRepo} from 'infra/attributeTypes/attributeSimpleLinkRepo';
import {type ILinkValue} from '_types/value';

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

            describe('getValues', () => {
                test('Should return values for a record', async () => {
                    const values = await attributeSimpleLinkRepo.getValues({
                        library: libraryId,
                        attribute: simpleLinkAttribute,
                        recordId: record1.id,
                        ctx,
                    });

                    expect(values).toEqual([record1Value]);
                });

                test('Should return empty array not existing record', async () => {
                    const values = await attributeSimpleLinkRepo.getValues({
                        library: libraryId,
                        attribute: simpleLinkAttribute,
                        recordId: 'no-exists',
                        ctx,
                    });

                    expect(values).toEqual([]);
                });

                test('Should return empty array record without attribute', async () => {
                    const record3WithoutAttr = await createRecord({});

                    const values = await attributeSimpleLinkRepo.getValues({
                        library: libraryId,
                        attribute: simpleLinkAttribute,
                        recordId: record3WithoutAttr.id,
                        ctx,
                    });

                    expect(values).toEqual([]);
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
