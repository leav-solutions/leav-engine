import recordRepo from 'infra/recordRepo';
import recordDomain from './recordDomain';

describe('RecordDomain', () => {
    describe('createRecord', () => {
        test('Should create a new record', async function() {
            const createdRecordData = {id: 222435651, library: 'test', created_at: 1519303348, modified_at: 1519303348};
            const mockRecordRepo = {
                createRecord: jest.fn().mockReturnValue(Promise.resolve(createdRecordData))
            };

            const recDomain = recordDomain(mockRecordRepo);

            const createdRecord = await recDomain.createRecord('test');
            expect(mockRecordRepo.createRecord.mock.calls.length).toBe(1);
            expect(Number.isInteger(mockRecordRepo.createRecord.mock.calls[0][1].created_at)).toBe(true);
            expect(Number.isInteger(mockRecordRepo.createRecord.mock.calls[0][1].modified_at)).toBe(true);

            expect(createdRecord).toMatchObject(createdRecordData);
        });
    });

    describe('deleteRecord', () => {
        const recordData = {id: 222435651, library: 'test', created_at: 1519303348, modified_at: 1519303348};

        test('Should delete an record and return deleted record', async function() {
            const mockLibRepo = {deleteRecord: jest.fn().mockReturnValue(Promise.resolve(recordData))};
            const recDomain = recordDomain(mockLibRepo);

            const deleteRes = await recDomain.deleteRecord('test', recordData.id);

            expect(mockLibRepo.deleteRecord.mock.calls.length).toBe(1);
        });

        // TODO: handle unknown record?
        // test('Should throw if unknown record', async function() {
        //     const mockLibRepo = {deleteRecord: jest.fn().mockReturnValue(Promise.resolve(recordData))};
        //     const recDomain = recordDomain(mockLibRepo);

        //     await expect(recDomain.deleteRecord(recordData.id)).rejects.toThrow();
        // });
    });
});
