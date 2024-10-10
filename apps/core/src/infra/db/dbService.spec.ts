// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {IUtils, ToAny} from 'utils/utils';
import {IConfig} from '_types/config';
import dbService, {IDbServiceDeps} from './dbService';

const depsBase: ToAny<IDbServiceDeps> = {
    'core.infra.db': jest.fn(),
    'core.utils': jest.fn(),
    config: {}
};

describe('dbService', () => {
    const ctx = {
        userId: '0',
        queryId: 'testDbService'
    };

    const mockConfig = {
        dbProfiler: {
            enable: false
        }
    };

    describe('collectionExists', () => {
        test('Should check if a collection already exists', async () => {
            const mockDb = new Database();
            mockDb.listCollections = jest.fn().mockReturnValue(Promise.resolve([{name: 'test'}]));

            const dbServ = dbService({...depsBase, 'core.infra.db': mockDb, config: mockConfig as IConfig});

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
                rethrow: jest.fn<never, any[]>().mockImplementation(e => {
                    throw e;
                })
            };

            mockDb.query = global.__mockPromise({all: jest.fn()});

            const dbServ = dbService({
                'core.infra.db': mockDb,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as IConfig
            });

            const res = await dbServ.execute({
                query: 'FOR e in elems RETURN e',
                ctx
            });

            expect(mockDb.query).toBeCalled();
        });

        test('Should retry query on conflicts', async () => {
            const mockDb = new Database();

            const mockUtils: Mockify<IUtils> = {
                rethrow: jest.fn<never, any[]>().mockImplementation(e => {
                    throw e;
                })
            };

            /* eslint-disable no-throw-literal */
            mockDb.query = jest
                .fn()
                .mockImplementationOnce(q => {
                    throw {isArangoError: true, errorNum: 1200};
                })
                .mockImplementationOnce(q => {
                    throw {isArangoError: true, errorNum: 1200};
                })
                .mockImplementationOnce(q => mockDbCursor);

            const dbServ = dbService({
                'core.infra.db': mockDb,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as IConfig
            });

            const res = await dbServ.execute({
                query: 'FOR e in elems RETURN e',
                ctx
            });

            expect(mockDb.query).toBeCalledTimes(3);
        });

        test('Should limit number of retries and throw', async () => {
            const mockDb = new Database();

            const mockUtils: Mockify<IUtils> = {
                rethrow: jest.fn<never, any[]>().mockImplementation(e => {
                    throw new Error();
                })
            };

            mockDb.query = jest.fn().mockImplementation(q => {
                throw {isArangoError: true, errorNum: 1200};
            });

            const dbServ = dbService({
                'core.infra.db': mockDb,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as IConfig
            });

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
