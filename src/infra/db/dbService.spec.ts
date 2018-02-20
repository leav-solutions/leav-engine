import dbService from './dbService';
import {Database} from 'arangojs';
import {DocumentCollection} from 'arangojs/lib/esm/collection';
describe('dbService', () => {
    describe('collectionExists', () => {
        test('Should check if a collection already exists', async () => {
            const mockDb = new Database();
            mockDb.listCollections = jest.fn().mockReturnValue(Promise.resolve([{name: 'test'}]));

            const dbServ = dbService(mockDb);

            expect(await dbServ.collectionExists('test')).toBe(true);
            expect(await dbServ.collectionExists('dontExists')).toBe(false);
        });
    });
});
