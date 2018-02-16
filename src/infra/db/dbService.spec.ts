import dbService from './dbService';
import {Database} from 'arangojs';
import {DocumentCollection} from 'arangojs/lib/esm/collection';
describe('dbService', () => {
    describe('createCollection', () => {
        test('Should reject if collection already exists', async () => {
            const mockDb = new Database();
            mockDb.listCollections = jest.fn().mockReturnValue(Promise.resolve([{name: 'test'}]));

            const dbServ = dbService(mockDb);

            await expect(dbServ.createCollection('test')).rejects.toBeInstanceOf(Error);
        });
    });
});
