// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, Database} from 'arangojs';
import {DocumentCollection} from 'arangojs/collection';
import {asFunction, AwilixContainer} from 'awilix';
import {resolve} from 'dns';
import {readdirSync} from 'fs';
import {ICachesService} from 'infra/cache/cacheService';
import {IPluginsRepo} from 'infra/plugins/pluginsRepo';
import {Winston} from 'winston';
import {IAttributeFilterOptions} from '_types/attribute';
import {IConfig} from '_types/config';
import {ITree} from '_types/tree';
import {SortOrder} from '../../_types/list';
import {ATTRIB_COLLECTION_NAME} from '../attributeTypes/attributeTypesRepo';
import {TREES_COLLECTION_NAME} from '../tree/treeRepo';
import {IDbService} from './dbService';
import dbUtils, {IDbUtils} from './dbUtils';
import loadMigrationFile from './helpers/loadMigrationFile';

describe('dbUtils', () => {
    const mockConf: Partial<IConfig> = {lang: {available: ['fr', 'en'], default: 'fr'}, defaultUserId: '1'};
    const ctx = {
        userId: '0',
        queryId: '123456'
    };
    afterAll(() => {
        jest.clearAllMocks();
    });

    describe('cleanupSystemKeys', () => {
        test('Should remove all system keys', () => {
            const testDbUtils = dbUtils();

            const testObj = {
                _key: 'testKey',
                _id: 'testId',
                _rev: 'testRev',
                _randomSystemKey: 'test',
                normalKey: 'shouldBeKept'
            };

            const res = testDbUtils.cleanup(testObj);

            expect(res).toMatchObject({id: 'testKey', normalKey: 'shouldBeKept'});
        });

        test('Should return null if param is null', () => {
            const testDbUtils = dbUtils();

            const res = testDbUtils.cleanup(null);

            expect(res).toBeNull();
        });
    });

    describe('convertToDoc', () => {
        test('Should add needed system keys', () => {
            const testDbUtils = dbUtils();

            const testObj = {
                id: 'testId',
                normalKey: 'shouldBeKept'
            };

            const res = testDbUtils.convertToDoc(testObj);

            expect(res).toMatchObject({_key: 'testId', normalKey: 'shouldBeKept'});
        });
    });

    describe('findCoreEntity', () => {
        let mockDbServ;
        let testDbUtils: IDbUtils;
        beforeEach(() => {
            mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _key: 'categories',
                        _id: 'core_trees/categories',
                        _rev: '_Wm_Qdtu--_',
                        label: {
                            fr: 'Arbre des catégories'
                        },
                        libraries: ['categories'],
                        system: false
                    }
                ])
            };
            testDbUtils = dbUtils({
                'core.infra.db.dbService': mockDbServ,
                config: mockConf as IConfig
            });
            testDbUtils.cleanup = jest.fn().mockReturnValue({
                id: 'categories',
                system: false,
                label: {
                    fr: 'Arbre des catégories'
                }
            });
            testDbUtils.convertToDoc = jest.fn().mockReturnValue({
                _key: 'categories',
                system: false,
                label: 'Arbre des catégories'
            });
        });

        test('Find core entity without filters', async () => {
            const res = await testDbUtils.findCoreEntity({
                collectionName: TREES_COLLECTION_NAME,
                ctx
            });

            expect(res.list).toHaveLength(1);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars['@value0']).toBe('core_trees');
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(res.list[0]).toMatchObject({
                id: 'categories',
                system: false,
                label: {
                    fr: 'Arbre des catégories'
                }
            });
        });

        test('Filter with a LIKE on ID', async function () {
            const res = await testDbUtils.findCoreEntity({
                collectionName: TREES_COLLECTION_NAME,
                filters: {id: 'test'},
                ctx
            });

            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/(FILTER LIKE){1}/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });

        test('Should filter label on any language', async function () {
            const res = await testDbUtils.findCoreEntity({
                collectionName: TREES_COLLECTION_NAME,
                filters: {label: 'test'},
                ctx
            });

            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/(LIKE(.*)label\.(.*)OR LIKE(.*)label\.)/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });

        test('Should limit results', async function () {
            const mockDbServLimit = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _key: 'categories',
                        _id: 'core_trees/categories',
                        _rev: '_Wm_Qdtu--_',
                        label: {
                            fr: 'Arbre des catégories'
                        },
                        libraries: ['categories'],
                        system: false
                    }
                ])
            };
            const testDbUtilsLimit = dbUtils({
                'core.infra.db.dbService': mockDbServLimit,
                config: mockConf as IConfig
            });
            const res = await testDbUtilsLimit.findCoreEntity({
                collectionName: TREES_COLLECTION_NAME,
                withCount: true,
                pagination: {limit: 5, offset: 0},
                ctx
            });

            expect(mockDbServLimit.execute.mock.calls[0][0].query.query).toMatch(/LIMIT/);
            expect(mockDbServLimit.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServLimit.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });

        test('Should sort results', async function () {
            const mockDbServLimit = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _key: 'categories',
                        _id: 'core_trees/categories',
                        _rev: '_Wm_Qdtu--_',
                        label: {
                            fr: 'Arbre des catégories'
                        },
                        libraries: ['categories'],
                        system: false
                    }
                ])
            };
            const testDbUtilsLimit = dbUtils({
                'core.infra.db.dbService': mockDbServLimit,
                config: mockConf as IConfig
            });
            const res = await testDbUtilsLimit.findCoreEntity({
                collectionName: TREES_COLLECTION_NAME,
                withCount: true,
                sort: {
                    field: 'system',
                    order: SortOrder.ASC
                },
                ctx
            });

            expect(mockDbServLimit.execute.mock.calls[0][0].query.query).toMatch(/SORT/);
            expect(mockDbServLimit.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServLimit.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });

        test('Should convert ID key when sorting', async function () {
            const mockDbServLimit = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _key: 'categories',
                        _id: 'core_trees/categories',
                        _rev: '_Wm_Qdtu--_',
                        label: {
                            fr: 'Arbre des catégories'
                        },
                        libraries: ['categories'],
                        system: false
                    }
                ])
            };
            const testDbUtilsLimit = dbUtils({
                'core.infra.db.dbService': mockDbServLimit,
                config: mockConf as IConfig
            });
            const res = await testDbUtilsLimit.findCoreEntity({
                collectionName: TREES_COLLECTION_NAME,
                withCount: true,
                sort: {
                    field: 'id',
                    order: SortOrder.ASC
                },
                ctx
            });

            expect(mockDbServLimit.execute.mock.calls[0][0].query.bindVars.value1).toBe('_key');
        });

        test('Should return an empty array if no results', async function () {
            mockDbServ = {db: new Database(), execute: global.__mockPromise([])};
            testDbUtils = dbUtils({
                'core.infra.db.dbService': mockDbServ,
                config: mockConf as IConfig
            });
            testDbUtils.cleanup = jest.fn();
            testDbUtils.convertToDoc = jest.fn();

            mockDbServ = {execute: global.__mockPromise([])};
            const res = await testDbUtils.findCoreEntity<ITree>({
                collectionName: TREES_COLLECTION_NAME,
                ctx
            });

            expect(res.list).toBeInstanceOf(Array);
            expect(res.list.length).toBe(0);
        });

        test('Should use custom filter condtion supplied', async () => {
            const mockDbServCustom = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _key: 'test_attr',
                        _id: 'core_attributes/test_attr',
                        _rev: '_Wm_Qdtu--_',
                        label: {
                            fr: 'Test'
                        }
                    }
                ])
            };
            testDbUtils = dbUtils({
                'core.infra.db.dbService': mockDbServCustom,
                config: mockConf as IConfig
            });
            testDbUtils.cleanup = jest.fn();
            testDbUtils.convertToDoc = jest.fn().mockReturnValue({
                libraries: ['test']
            });

            const customFilter = jest.fn(() => aql`CUSTOM FILTER`);
            const filters: IAttributeFilterOptions = {libraries: ['test']};
            await testDbUtils.findCoreEntity({
                collectionName: ATTRIB_COLLECTION_NAME,
                filters,
                customFilterConditions: {libraries: customFilter},
                ctx
            });

            expect(customFilter).toBeCalled();
            expect(mockDbServCustom.execute.mock.calls[0][0].query.query).toMatch(/(CUSTOM FILTER){1}/);
        });
    });
    describe('migrate', () => {
        test('Run core migrations', async () => {
            // Mock migration files
            const mockRun1 = jest.fn();
            const file1 = {
                default: () => ({
                    run: mockRun1
                })
            };
            const mockRun2 = jest.fn();
            const file2 = {
                default: () => ({
                    run: mockRun2
                })
            };
            (loadMigrationFile as jest.FunctionLike) = global.__mockPromiseMultiple([file1, file2]);

            // Mock migration files reading
            (readdirSync as jest.FunctionLike) = jest.fn().mockReturnValue(['000.ts', '001.ts']);
            (resolve as jest.FunctionLike) = jest
                .fn()
                .mockReturnValueOnce('/fakeDir/migrations')
                .mockReturnValueOnce('/fakeDir/migrations/000.ts')
                .mockReturnValueOnce('/fakeDir/migrations/001.ts');

            // Mock DB functions
            const mockCollecSave = jest.fn();
            const mockDb = {
                Database: jest.fn(),
                listCollections: global.__mockPromise([]),
                collection: () =>
                    ({
                        create: jest.fn(),
                        save: mockCollecSave
                    }) as unknown as DocumentCollection
            };
            const mockDbServ: Mockify<IDbService> = {
                db: mockDb as unknown as Database,
                execute: global.__mockPromise([])
            };

            const mockCacheService: Mockify<ICachesService> = {
                getCache: jest.fn(() => ({
                    deleteAll: jest.fn()
                }))
            };

            const mockDepsManager = {
                build: depDefault => depDefault()
            };
            (asFunction as jest.FunctionLike) = m => m;

            const mockLogger: Mockify<Winston> = {
                info: jest.fn()
            };

            const mockPluginsRepo: Mockify<IPluginsRepo> = {
                getRegisteredPlugins: jest.fn().mockReturnValue([])
            };

            const testDbUtils = dbUtils({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.cache.cacheService': mockCacheService as ICachesService,
                'core.utils.logger': mockLogger as Winston,
                'core.infra.plugins': mockPluginsRepo as IPluginsRepo,
                config: mockConf as IConfig
            });

            await testDbUtils.migrate(mockDepsManager as AwilixContainer);

            expect(mockRun1).toBeCalled();
            expect(mockRun2).toBeCalled();
            expect(mockCollecSave).toBeCalledTimes(2);
        });
    });
});
