import {aql, Database} from 'arangojs';
import {type DocumentCollection} from 'arangojs/collection';
import * as awilix from 'awilix';
import {resolve} from 'dns';
import * as fs from 'fs';
import {type ICachesService} from '../cache/cacheService';
import {type ILogger} from '@leav/logger';
import {type IAttributeFilterOptions} from '../../_types/attribute';
import {type IConfig} from '../../_types/config';
import {type ITree} from '../../_types/tree';
import {SortOrder} from '../../_types/list';
import {ATTRIB_COLLECTION_NAME} from '../attributeTypes/attributeTypesRepo';
import {TREES_COLLECTION_NAME} from '../tree/treeRepo';
import {type IDbService} from './dbService';
import dbUtils, {type IDbUtils} from './dbUtils';
import loadMigrationFile from './helpers/loadMigrationFile';

vi.mock('./helpers/loadMigrationFile');
vi.mock('awilix', async () => {
    const actual = await vi.importActual<typeof awilix>('awilix');
    return {...actual, asFunction: vi.fn(m => m)};
});

describe('dbUtils', () => {
    const mockConf: Partial<IConfig> = {
        lang: {available: ['fr', 'en'], default: 'fr'},
        defaultUserId: '1',
        pluginsPath: [],
    };
    const ctx = {
        userId: '0',
        queryId: '123456',
    };
    afterAll(() => {
        vi.clearAllMocks();
    });

    describe('cleanupSystemKeys', () => {
        test('Should remove all system keys', () => {
            const testDbUtils = dbUtils();

            const testObj = {
                _key: 'testKey',
                _id: 'testId',
                _rev: 'testRev',
                _randomSystemKey: 'test',
                normalKey: 'shouldBeKept',
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
                normalKey: 'shouldBeKept',
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
                            fr: 'Arbre des catégories',
                        },
                        libraries: ['categories'],
                        system: false,
                    },
                ]),
            };
            testDbUtils = dbUtils({
                'core.infra.db.dbService': mockDbServ,
                config: mockConf as IConfig,
            });
            testDbUtils.cleanup = vi.fn().mockReturnValue({
                id: 'categories',
                system: false,
                label: {
                    fr: 'Arbre des catégories',
                },
            });
            testDbUtils.convertToDoc = vi.fn().mockReturnValue({
                _key: 'categories',
                system: false,
                label: 'Arbre des catégories',
            });
        });

        test('Find core entity without filters', async () => {
            const res = await testDbUtils.findCoreEntity({
                collectionName: TREES_COLLECTION_NAME,
                ctx,
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
                    fr: 'Arbre des catégories',
                },
            });
        });

        test('Filter with a LIKE on ID', async function () {
            const res = await testDbUtils.findCoreEntity({
                collectionName: TREES_COLLECTION_NAME,
                filters: {id: 'test'},
                ctx,
            });

            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/(FILTER LIKE){1}/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });

        test('Should filter label on any language', async function () {
            const res = await testDbUtils.findCoreEntity({
                collectionName: TREES_COLLECTION_NAME,
                filters: {label: 'test'},
                ctx,
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
                            fr: 'Arbre des catégories',
                        },
                        libraries: ['categories'],
                        system: false,
                    },
                ]),
            };
            const testDbUtilsLimit = dbUtils({
                'core.infra.db.dbService': mockDbServLimit,
                config: mockConf as IConfig,
            });
            const res = await testDbUtilsLimit.findCoreEntity({
                collectionName: TREES_COLLECTION_NAME,
                withCount: true,
                pagination: {limit: 5, offset: 0},
                ctx,
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
                            fr: 'Arbre des catégories',
                        },
                        libraries: ['categories'],
                        system: false,
                    },
                ]),
            };
            const testDbUtilsLimit = dbUtils({
                'core.infra.db.dbService': mockDbServLimit,
                config: mockConf as IConfig,
            });
            const res = await testDbUtilsLimit.findCoreEntity({
                collectionName: TREES_COLLECTION_NAME,
                withCount: true,
                sort: {
                    field: 'system',
                    order: SortOrder.ASC,
                },
                ctx,
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
                            fr: 'Arbre des catégories',
                        },
                        libraries: ['categories'],
                        system: false,
                    },
                ]),
            };
            const testDbUtilsLimit = dbUtils({
                'core.infra.db.dbService': mockDbServLimit,
                config: mockConf as IConfig,
            });
            const res = await testDbUtilsLimit.findCoreEntity({
                collectionName: TREES_COLLECTION_NAME,
                withCount: true,
                sort: {
                    field: 'id',
                    order: SortOrder.ASC,
                },
                ctx,
            });

            expect(mockDbServLimit.execute.mock.calls[0][0].query.bindVars.value1).toBe('_key');
        });

        test('Should return an empty array if no results', async function () {
            mockDbServ = {db: new Database(), execute: global.__mockPromise([])};
            testDbUtils = dbUtils({
                'core.infra.db.dbService': mockDbServ,
                config: mockConf as IConfig,
            });
            testDbUtils.cleanup = vi.fn();
            testDbUtils.convertToDoc = vi.fn();

            mockDbServ = {execute: global.__mockPromise([])};
            const res = await testDbUtils.findCoreEntity<ITree>({
                collectionName: TREES_COLLECTION_NAME,
                ctx,
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
                            fr: 'Test',
                        },
                    },
                ]),
            };
            testDbUtils = dbUtils({
                'core.infra.db.dbService': mockDbServCustom,
                config: mockConf as IConfig,
            });
            testDbUtils.cleanup = vi.fn();
            testDbUtils.convertToDoc = vi.fn().mockReturnValue({
                libraries: ['test'],
            });

            const customFilter = vi.fn(() => aql`CUSTOM FILTER`);
            const filters: IAttributeFilterOptions = {libraries: ['test']};
            await testDbUtils.findCoreEntity({
                collectionName: ATTRIB_COLLECTION_NAME,
                filters,
                customFilterConditions: {libraries: customFilter},
                ctx,
            });

            expect(customFilter).toBeCalled();
            expect(mockDbServCustom.execute.mock.calls[0][0].query.query).toMatch(/(CUSTOM FILTER){1}/);
        });
    });
    describe('migrate', () => {
        test('Run core migrations', async () => {
            // Mock migration files
            const mockRun1 = vi.fn();
            const file1 = {
                default: () => ({
                    run: mockRun1,
                }),
            };
            const mockRun2 = vi.fn();
            const file2 = {
                default: () => ({
                    run: mockRun2,
                }),
            };
            vi.mocked(loadMigrationFile)
                .mockResolvedValueOnce(file1 as any)
                .mockResolvedValueOnce(file2 as any);

            // Mock migration files reading
            vi.spyOn(fs.promises, 'readdir').mockResolvedValue(['000.ts', '001.ts'] as any);

            // Mock DB functions
            const mockCollecSave = vi.fn();
            const mockDb = {
                Database: vi.fn(),
                listCollections: global.__mockPromise([]),
                collection: () =>
                    ({
                        create: vi.fn(),
                        save: mockCollecSave,
                    }) as unknown as DocumentCollection,
            };
            const mockDbServ: Mockify<IDbService> = {
                db: mockDb as unknown as Database,
                execute: global.__mockPromise([]),
            };

            const mockCacheService: Mockify<ICachesService> = {
                getCache: vi.fn(() => ({
                    deleteAll: vi.fn(),
                })),
            };

            const mockDepsManager = {
                build: depDefault => depDefault(),
            };
            vi.mocked(awilix.asFunction).mockImplementation(m => m as any);

            const mockLogger: Mockify<ILogger> = {
                info: vi.fn(),
            };

            const testDbUtils = dbUtils({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.cache.cacheService': mockCacheService as ICachesService,
                'core.utils.logger': mockLogger as ILogger,
                config: mockConf as IConfig,
            });

            await testDbUtils.migrate(mockDepsManager as awilix.AwilixContainer);

            expect(mockRun1).toBeCalled();
            expect(mockRun2).toBeCalled();
            expect(mockCollecSave).toBeCalledTimes(2);
        });
    });
});
