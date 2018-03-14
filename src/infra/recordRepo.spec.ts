import recordRepo from './recordRepo';

describe('RecordRepo', () => {
    describe('createRecord', () => {
        test('Should create a new record', async function() {
            const recordData = {created_at: 1519303348, modified_at: 1519303348};
            const createdRecordData = {
                _id: 'users/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const cleanCreatedRecordData = {
                id: 222435651,
                library: 'users',
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const mockDbCollec = {
                save: global.__mockPromise(createdRecordData),
                document: global.__mockPromise(createdRecordData)
            };

            const mockDb = {collection: jest.fn().mockReturnValue(mockDbCollec)};

            const mockDbServ = {db: mockDb};

            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(cleanCreatedRecordData)
            };

            const recRepo = recordRepo(mockDbServ, mockDbUtils);

            const createdRecord = await recRepo.createRecord('test', recordData);
            expect(mockDbCollec.save.mock.calls.length).toBe(1);
            expect(mockDbCollec.save).toBeCalledWith(recordData);

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);
            expect(mockDbUtils.cleanup.mock.calls[0][0].hasOwnProperty('library')).toBe(true);

            expect(createdRecord).toMatchObject(cleanCreatedRecordData);
        });
    });

    describe('deleteRecord', () => {
        test('Should delete a record and return deleted record', async function() {
            const recordData = {id: 222435651, created_at: 1519303348, modified_at: 1519303348};
            const deletedRecordData = {
                _id: 'users/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const mockDbCollec = {
                remove: global.__mockPromise(deletedRecordData)
            };

            const mockDb = {collection: jest.fn().mockReturnValue(mockDbCollec)};

            const mockDbServ = {db: mockDb};

            const mockDbUtils = {cleanup: jest.fn().mockReturnValue(recordData)};

            const recRepo = recordRepo(mockDbServ, mockDbUtils);

            const deleteRes = await recRepo.deleteRecord('users', recordData.id);

            expect(mockDbCollec.remove.mock.calls.length).toBe(1);
            expect(mockDbCollec.remove).toBeCalledWith({_key: recordData.id});

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);

            expect(deleteRes).toMatchObject(recordData);
        });
    });
});
