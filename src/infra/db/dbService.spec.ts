import {Database} from 'arangojs';
import {IUtils} from 'utils/utils';
import dbService from './dbService';
describe('dbService', () => {
    const ctx = {
        userId: 0,
        queryId: 'testDbService'
    };
    describe('collectionExists', () => {
        test('Should check if a collection already exists', async () => {
            const mockDb = new Database();
            mockDb.listCollections = jest.fn().mockReturnValue(Promise.resolve([{name: 'test'}]));

            const dbServ = dbService({'core.infra.db': mockDb});

            expect(await dbServ.collectionExists('test')).toBe(true);
            expect(await dbServ.collectionExists('dontExists')).toBe(false);
        });
    });
    describe('execute', () => {
        const mockDbCursor = {
            all: jest.fn()
        };

        test('Should run query', async () => {
            const mockDb = new Database();

            const mockUtils: Mockify<IUtils> = {
                rethrow: jest.fn().mockImplementation(e => {
                    throw e;
                })
            };

            mockDb.query = global.__mockPromise({all: jest.fn()});

            const dbServ = dbService({'core.infra.db': mockDb, 'core.utils': mockUtils as IUtils});

            const res = await dbServ.execute({
                query: 'FOR e in elems RETURN e',
                ctx
            });

            expect(mockDb.query).toBeCalled();
        });

        test('Should retry query on conflicts', async () => {
            const mockDb = new Database();

            const mockUtils: Mockify<IUtils> = {
                rethrow: jest.fn().mockImplementation(e => {
                    throw e;
                })
            };

            mockDb.query = jest
                .fn()
                .mockImplementationOnce(q => {
                    throw {isArangoError: true, errorNum: 1200};
                })
                .mockImplementationOnce(q => {
                    throw {isArangoError: true, errorNum: 1200};
                })
                .mockImplementationOnce(q => mockDbCursor);

            const dbServ = dbService({'core.infra.db': mockDb, 'core.utils': mockUtils as IUtils});

            const res = await dbServ.execute({
                query: 'FOR e in elems RETURN e',
                ctx
            });

            expect(mockDb.query).toBeCalledTimes(3);
        });

        test('Should limit number of retries and throw', async () => {
            const mockDb = new Database();

            const mockUtils: Mockify<IUtils> = {
                rethrow: jest.fn().mockImplementation(e => {
                    throw new Error();
                })
            };

            mockDb.query = jest.fn().mockImplementation(q => {
                throw {isArangoError: true, errorNum: 1200};
            });

            const dbServ = dbService({'core.infra.db': mockDb, 'core.utils': mockUtils as IUtils});

            await expect(
                dbServ.execute({
                    query: 'FOR e in elems RETURN e',
                    ctx
                })
            ).rejects.toThrow();
            expect(mockDb.query).toBeCalledTimes(11);
        });
    });
});
