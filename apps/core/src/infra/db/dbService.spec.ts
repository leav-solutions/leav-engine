// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {type IUtils, type ToAny} from '../../utils/utils';
import {type IConfig} from '../../_types/config';
import dbService, {type IDbServiceDeps} from './dbService';

const depsBase: ToAny<IDbServiceDeps> = {
    'core.infra.db': vi.fn(),
    'core.utils': vi.fn(),
    config: {},
};

describe('dbService', () => {
    const ctx = {
        userId: '0',
        queryId: 'testDbService',
    };

    const mockConfig = {
        dbProfiler: {
            enable: false,
        },
    };

    describe('collectionExists', () => {
        test('Should check if a collection already exists', async () => {
            const mockDb = new Database();
            mockDb.listCollections = vi.fn().mockReturnValue(Promise.resolve([{name: 'test'}]));

            const dbServ = dbService({...depsBase, 'core.infra.db': mockDb, config: mockConfig as IConfig});

            expect(await dbServ.collectionExists('test')).toBe(true);
            expect(await dbServ.collectionExists('dontExists')).toBe(false);
        });
    });
    describe('execute', () => {
        const mockDbCursor = {
            all: vi.fn(),
        };

        test('Should run query', async () => {
            const mockDb = new Database();

            const mockUtils: Mockify<IUtils> = {
                rethrow: vi.fn().mockImplementation(e => {
                    throw e;
                }) as never,
            };

            mockDb.query = global.__mockPromise({all: vi.fn()});

            const dbServ = dbService({
                'core.infra.db': mockDb,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as IConfig,
            });

            const res = await dbServ.execute({
                query: 'FOR e in elems RETURN e',
                ctx,
            });

            expect(mockDb.query).toBeCalled();
        });

        test('Should retry query on conflicts', async () => {
            const mockDb = new Database();

            const mockUtils: Mockify<IUtils> = {
                rethrow: vi.fn().mockImplementation(e => {
                    throw e;
                }) as never,
            };

            /* eslint-disable no-throw-literal */
            mockDb.query = vi
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
                config: mockConfig as IConfig,
            });

            const res = await dbServ.execute({
                query: 'FOR e in elems RETURN e',
                ctx,
            });

            expect(mockDb.query).toBeCalledTimes(3);
        });

        test('Should limit number of retries and throw', async () => {
            const mockDb = new Database();

            const mockUtils: Mockify<IUtils> = {
                rethrow: vi.fn().mockImplementation(e => {
                    throw new Error();
                }) as never,
            };

            mockDb.query = vi.fn().mockImplementation(q => {
                throw {isArangoError: true, errorNum: 1200};
            });

            const dbServ = dbService({
                'core.infra.db': mockDb,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as IConfig,
            });

            await expect(
                dbServ.execute({
                    query: 'FOR e in elems RETURN e',
                    ctx,
                }),
            ).rejects.toThrow();
            expect(mockDb.query).toBeCalledTimes(11);
        });
    });
});
