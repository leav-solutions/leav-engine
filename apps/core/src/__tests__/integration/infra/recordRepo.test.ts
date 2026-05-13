// import {IQueryInfos} from '../../../_types/queryInfos';
import {type ILibraryRepo} from '../../../infra/library/libraryRepo';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {AttributeTypes} from '../../../_types/attribute';
import {AttributeCondition, Operator, type IRecord} from '../../../_types/record';
import {getLibraryRepo, getRecordRepo} from './integrationTestRepoUtils';
import {type IQueryInfos} from '../../../_types/queryInfos';

// Partial tests, to be completed !
// TODO - find, many cases with all kind of filters on attributes
describe('recordRepo', () => {
    let recordRepo: IRecordRepo;
    let libraryRepo: ILibraryRepo;

    const libraryId = 'test_lib_record_repo';
    const ctx: IQueryInfos = {
        userId: '1',
    };

    beforeAll(async () => {
        libraryRepo = getLibraryRepo();
        recordRepo = getRecordRepo();

        await libraryRepo.createLibrary({
            libData: {
                id: libraryId,
            },
            ctx,
        });
    });

    it('createRecord should create a record with simple attributes', async () => {
        const record = await recordRepo.createRecord({
            libraryId,
            recordData: {
                active: true,
                created_at: Date.now(),
                created_by: '1',
                modified_at: Date.now(),
                modified_by: '1',
                text_attr: 'value1',
            },
            ctx,
        });

        expect(record).toMatchObject({
            id: expect.any(String),
            library: libraryId,
            active: true,
            created_at: expect.any(Number),
            created_by: '1',
            modified_at: expect.any(Number),
            modified_by: '1',
            text_attr: 'value1',
        });

        const createdRecord = await recordRepo.getRecord({
            libraryId,
            recordId: record.id,
            ctx,
        });

        expect(createdRecord).toEqual(record);
    });

    it('updateRecord should throw when update a record that does not exist', async () => {
        const nonExistentId = 'non-existent-id';
        await expect(
            recordRepo.updateRecord({
                libraryId,
                recordData: {
                    id: nonExistentId,
                    active: true,
                    created_at: Date.now(),
                    created_by: '1',
                    modified_at: Date.now(),
                    modified_by: '2',
                    text_attr: 'value1',
                },
                ctx,
            }),
        ).rejects.toThrow('document not found');
    });

    it('deleteRecord should throw when delete a record that does not exist', async () => {
        const nonExistentId = 'non-existent-id';
        await expect(
            recordRepo.deleteRecord({
                libraryId,
                recordId: nonExistentId,
                ctx,
            }),
        ).rejects.toThrow('document not found');
    });

    describe('One record exists', () => {
        let record1: IRecord;

        beforeEach(async () => {
            record1 = await recordRepo.createRecord({
                libraryId,
                recordData: {
                    active: true,
                    created_at: Date.now(),
                    created_by: '1',
                    modified_at: Date.now(),
                    modified_by: '1',
                    text_attr: 'value1',
                },
                ctx,
            });
        });

        afterEach(async () => {
            if (record1) {
                await recordRepo.deleteRecord({
                    libraryId,
                    recordId: record1.id,
                    ctx,
                });
                record1 = null; // Clear the record reference
            }
        });

        it('updateRecord should update a record', async () => {
            const updatedRecord = await recordRepo.updateRecord({
                libraryId,
                recordData: {
                    id: record1.id,
                    active: false,
                    modified_at: Date.now(),
                    modified_by: '2',
                    text_attr: 'updated_value',
                },
                ctx,
            });
            expect(updatedRecord.old).toEqual(record1);
            expect(updatedRecord.new).toMatchObject({
                id: record1.id,
                library: libraryId,
                active: false,
                created_at: record1.created_at,
                created_by: record1.created_by,
                modified_at: expect.any(Number),
                modified_by: '2',
                text_attr: 'updated_value',
            });
            record1 = updatedRecord.new; // Update the reference to the modified record
        });

        it('deleteRecord should delete a record', async () => {
            const deleted = await recordRepo.deleteRecord({
                libraryId,
                recordId: record1.id,
                ctx,
            });

            expect(deleted).toBeDefined();
            expect(deleted.id).toEqual(record1.id);

            const findDeleted = await recordRepo.find({
                libraryId,
                filters: [
                    {
                        attributes: [{id: 'id', type: AttributeTypes.SIMPLE}],
                        condition: AttributeCondition.EQUAL,
                        value: record1.id,
                    },
                ],
                ctx,
            });

            expect(findDeleted.list).toHaveLength(0);

            const deletedRecord = await recordRepo.getRecord({
                libraryId,
                recordId: record1.id,
                ctx,
            });

            expect(deletedRecord).toBeNull();

            record1 = null; // Clear the record reference
        });
    });

    describe('Find records with filters', () => {
        const findLibraryId = 'test_lib_find_record_repo';
        let record1: IRecord;
        let record2: IRecord;
        let record3: IRecord;
        let record4: IRecord;

        beforeAll(async () => {
            libraryRepo = getLibraryRepo();

            await libraryRepo.createLibrary({
                libData: {
                    id: findLibraryId,
                },
                ctx,
            });
        });

        beforeEach(async () => {
            record1 = await recordRepo.createRecord({
                libraryId: findLibraryId,
                recordData: {
                    active: true,
                    created_at: Date.now(),
                    created_by: '1',
                    modified_at: Date.now(),
                    modified_by: '1',
                    text_attr: 'value1',
                },
                ctx,
            });

            record2 = await recordRepo.createRecord({
                libraryId: findLibraryId,
                recordData: {
                    active: true,
                    created_at: Date.now(),
                    created_by: '1',
                    modified_at: Date.now(),
                    modified_by: '1',
                    text_attr: 'value2',
                },
                ctx,
            });

            record3 = await recordRepo.createRecord({
                libraryId: findLibraryId,
                recordData: {
                    active: true,
                    created_at: Date.now(),
                    created_by: '1',
                    modified_at: Date.now(),
                    modified_by: '1',
                    text_attr: '',
                },
                ctx,
            });

            record4 = await recordRepo.createRecord({
                libraryId: findLibraryId,
                recordData: {
                    active: true,
                    created_at: Date.now(),
                    created_by: '1',
                    modified_at: Date.now(),
                    modified_by: '1',
                },
                ctx,
            });
        });

        afterEach(async () => {
            if (record1) {
                await recordRepo.deleteRecord({
                    libraryId: findLibraryId,
                    recordId: record1.id,
                    ctx,
                });
                record1 = null; // Clear the record reference
            }
            if (record2) {
                await recordRepo.deleteRecord({
                    libraryId: findLibraryId,
                    recordId: record2.id,
                    ctx,
                });
                record2 = null; // Clear the record reference
            }
            if (record3) {
                await recordRepo.deleteRecord({
                    libraryId: findLibraryId,
                    recordId: record3.id,
                    ctx,
                });
                record3 = null; // Clear the record reference
            }
            if (record4) {
                await recordRepo.deleteRecord({
                    libraryId: findLibraryId,
                    recordId: record4.id,
                    ctx,
                });
                record4 = null; // Clear the record reference
            }
        });

        test('find records with EQUAL filter', async () => {
            const records = await recordRepo.find({
                libraryId: findLibraryId,
                filters: [
                    {
                        attributes: [{id: 'text_attr', type: AttributeTypes.SIMPLE}],
                        condition: AttributeCondition.EQUAL,
                        value: 'value1',
                    },
                ],
                ctx,
            });

            expect(records.list).toHaveLength(1);
            expect(records.list[0]).toMatchObject({
                id: record1.id,
            });
        });

        test('find records with EQUAL and IS_EMPTY filters', async () => {
            const records = await recordRepo.find({
                libraryId: findLibraryId,
                filters: [
                    {
                        attributes: [{id: 'text_attr', type: AttributeTypes.SIMPLE}],
                        condition: AttributeCondition.EQUAL,
                        value: 'value1',
                    },
                    {operator: Operator.OR},
                    {
                        attributes: [{id: 'text_attr', type: AttributeTypes.SIMPLE}],
                        condition: AttributeCondition.IS_EMPTY,
                        value: null,
                    },
                ],
                ctx,
            });

            expect(records.list).toHaveLength(3);

            const recordIds = records.list.map(r => r.id);

            expect(recordIds).toContain(record1.id);
            expect(recordIds).not.toContain(record2.id);
            expect(recordIds).toContain(record3.id);
            expect(recordIds).toContain(record4.id);
        });
    });
});
