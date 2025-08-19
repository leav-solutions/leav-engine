// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// import {IQueryInfos} from '_types/queryInfos';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IRecordRepo} from 'infra/record/recordRepo';
import {AttributeTypes} from '../../../_types/attribute';
import {AttributeCondition, IRecord} from '../../../_types/record';
import {getLibraryRepo, getRecordRepo} from './integrationTestRepoUtils';
import {IQueryInfos} from '_types/queryInfos';

// Partial tests, to be completed !
// TODO - find, many cases with all kind of filters on attributes
describe('recordRepo', () => {
    let recordRepo: IRecordRepo;
    let libraryRepo: ILibraryRepo;

    const libraryId = 'test_lib_record_repo';
    const ctx: IQueryInfos = {
        userId: '1'
    };

    beforeAll(async () => {
        libraryRepo = getLibraryRepo();
        recordRepo = getRecordRepo();

        await libraryRepo.createLibrary({
            libData: {
                id: libraryId
            },
            ctx
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
                text_attr: 'value1'
            },
            ctx
        });

        expect(record).toMatchObject({
            id: expect.any(String),
            library: libraryId,
            active: true,
            created_at: expect.any(Number),
            created_by: '1',
            modified_at: expect.any(Number),
            modified_by: '1',
            text_attr: 'value1'
        });

        const createdRecord = await recordRepo.getRecord({
            libraryId,
            recordId: record.id,
            ctx
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
                    text_attr: 'value1'
                },
                ctx
            })
        ).rejects.toThrow('document not found');
    });

    it('deleteRecord should throw when delete a record that does not exist', async () => {
        const nonExistentId = 'non-existent-id';
        await expect(
            recordRepo.deleteRecord({
                libraryId,
                recordId: nonExistentId,
                ctx
            })
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
                    text_attr: 'value1'
                },
                ctx
            });
        });

        afterEach(async () => {
            if (record1) {
                await recordRepo.deleteRecord({
                    libraryId,
                    recordId: record1.id,
                    ctx
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
                    text_attr: 'updated_value'
                },
                ctx
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
                text_attr: 'updated_value'
            });
            record1 = updatedRecord.new; // Update the reference to the modified record
        });

        it('deleteRecord should delete a record', async () => {
            const deleted = await recordRepo.deleteRecord({
                libraryId,
                recordId: record1.id,
                ctx
            });

            expect(deleted).toBeDefined();
            expect(deleted.id).toEqual(record1.id);

            const findDeleted = await recordRepo.find({
                libraryId,
                filters: [
                    {
                        attributes: [{id: 'id', type: AttributeTypes.SIMPLE}],
                        condition: AttributeCondition.EQUAL,
                        value: record1.id
                    }
                ],
                ctx
            });

            expect(findDeleted.list).toHaveLength(0);

            const deletedRecord = await recordRepo.getRecord({
                libraryId,
                recordId: record1.id,
                ctx
            });

            expect(deletedRecord).toBeNull();

            record1 = null; // Clear the record reference
        });
    });
});
