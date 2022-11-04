// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IValidateHelper} from 'domain/helpers/validate';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import fs from 'fs';
import path from 'path';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {ICacheService, ICachesService} from '../../infra/cache/cacheService';
import {Action, ImportMode} from '../../_types/import';
import importDomain from './importDomain';
import {mockTranslator} from '../../__tests__/mocks/translator';
import {i18n} from 'i18next';
import {UpdateTaskProgress} from 'domain/helpers/updateTaskProgress';

const importMockConfig: Mockify<Config.IImport> = {
    directory: path.resolve(__dirname, './imports'),
    sizeLimit: 100,
    groupData: 50
};

const mockConfig: Mockify<Config.IConfig> = {
    import: importMockConfig as Config.IImport,
    lang: {available: ['fr', 'en'], default: 'fr'}
};

describe('importDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'importDomainTest'
    };

    beforeAll(async () => {
        await fs.promises.mkdir(importMockConfig.directory);
    });

    afterAll(async () => {
        await fs.promises.rmdir(importMockConfig.directory, {recursive: true});
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('tmp', () => {
        expect(true).toBe(true);
    });

    test('file doesnt exist', async () => {
        const imprtDomain = importDomain({config: mockConfig as Config.IConfig, translator: mockTranslator as i18n});

        expect(imprtDomain.import('kzdidnzj', ctx)).rejects.toThrow();
    });

    test('test import elements - simple and advanced links', async () => {
        const data = {
            elements: [
                {
                    library: 'test_import',
                    matches: [],
                    mode: ImportMode.UPSERT,
                    data: [
                        {
                            attribute: 'simple',
                            values: [
                                {
                                    value: 'one'
                                }
                            ],
                            action: Action.ADD
                        }
                    ],
                    links: [
                        {
                            attribute: 'advanced_link',
                            values: [
                                {
                                    value: '1'
                                }
                            ],
                            action: Action.REPLACE
                        }
                    ]
                },
                {
                    library: 'users_groups',
                    matches: [],
                    mode: ImportMode.UPSERT,
                    data: [
                        {
                            attribute: 'simple',
                            values: [
                                {
                                    value: 'test'
                                }
                            ],
                            action: Action.ADD
                        }
                    ],
                    links: []
                }
            ],
            trees: []
        };

        await fs.promises.writeFile(`${mockConfig.import.directory}/test.json`, JSON.stringify(data));

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise([{id: 'simple'}, {id: 'advanced_link'}])
        };

        const mockValueDomain: Mockify<IValueDomain> = {
            saveValue: global.__mockPromise([]),
            getValues: global.__mockPromise([])
        };

        const mockRecordDomain: Mockify<IRecordDomain> = {
            createRecord: global.__mockPromise({id: '1'})
        };

        const mockValidateHelper: Mockify<IValidateHelper> = {
            validateLibrary: global.__mockPromise()
        };

        const mockCacheService: Mockify<ICacheService> = {
            getData: jest
                .fn()
                .mockReturnValue(
                    Promise.resolve([
                        JSON.stringify({
                            library: 'users_groups',
                            recordIds: ['1'],
                            links: []
                        })
                    ])
                )
                .mockReturnValueOnce([
                    JSON.stringify({
                        library: 'test_import',
                        recordIds: ['1'],
                        links: [
                            {
                                attribute: 'advanced_link',
                                values: [
                                    {
                                        value: '1'
                                    }
                                ],
                                action: Action.REPLACE
                            }
                        ]
                    })
                ]),
            storeData: global.__mockPromise(),
            deleteAll: global.__mockPromise()
        };

        const mockCachesService: Mockify<ICachesService> = {
            getCache: jest.fn().mockReturnValue(mockCacheService)
        };

        const mockTasksManagerDomain: Mockify<ITasksManagerDomain> = {
            createTask: global.__mockPromise(),
            updateProgress: global.__mockPromise()
        };

        const mockUpdateTaskProgress: Mockify<UpdateTaskProgress> = global.__mockPromise();

        const imprtDomain = importDomain({
            config: mockConfig as Config.IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.domain.value': mockValueDomain as IValueDomain,
            'core.infra.cache.cacheService': mockCachesService as ICachesService,
            'core.domain.tasksManager': mockTasksManagerDomain as ITasksManagerDomain,
            'core.domain.helpers.updateTaskProgress': mockUpdateTaskProgress as UpdateTaskProgress,
            translator: mockTranslator as i18n
        });

        await imprtDomain.import('test.json', ctx, {id: 'fakeTaskId'});

        expect(mockRecordDomain.createRecord.mock.calls.length).toBe(2);
        expect(mockAttrDomain.getLibraryAttributes.mock.calls.length).toBe(3);
        expect(mockValidateHelper.validateLibrary.mock.calls.length).toBe(2);
        expect(mockValueDomain.saveValue.mock.calls.length).toBe(3);
        expect(mockValueDomain.getValues.mock.calls.length).toBe(1);

        // Delete remaining import file.
        await fs.promises.unlink(`${mockConfig.import.directory}/test.json`);

        expect(fs.existsSync(`${mockConfig.import.directory}/test.json`)).toBe(false);
    });

    test('test import elements - simple link with matches', async () => {
        const data = {
            elements: [
                {
                    library: 'test_import',
                    matches: [],
                    data: [],
                    links: [
                        {
                            attribute: 'simple_link',
                            values: [
                                {
                                    value: [
                                        {
                                            attribute: 'login',
                                            value: 'admin'
                                        }
                                    ]
                                }
                            ],
                            action: Action.ADD
                        }
                    ]
                }
            ],
            trees: []
        };

        await fs.promises.writeFile(`${mockConfig.import.directory}/test.json`, JSON.stringify(data));

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise([{id: 'simple_link'}])
        };

        const mockValueDomain: Mockify<IValueDomain> = {
            saveValue: global.__mockPromise([])
        };

        const mockRecordDomain: Mockify<IRecordDomain> = {
            createRecord: global.__mockPromise({id: '1'}),
            find: global.__mockPromise({totalCount: 1, list: [{id: '1'}]})
        };

        const mockValidateHelper: Mockify<IValidateHelper> = {
            validateLibrary: global.__mockPromise()
        };

        const mockCacheService: Mockify<ICacheService> = {
            getData: global.__mockPromise([
                JSON.stringify({
                    library: 'test_import',
                    recordIds: ['1'],
                    links: [
                        {
                            attribute: 'simple_link',
                            values: [
                                {
                                    value: [
                                        {
                                            attribute: 'login',
                                            value: 'admin'
                                        }
                                    ]
                                }
                            ],
                            action: Action.ADD
                        }
                    ]
                })
            ]),
            storeData: global.__mockPromise(),
            deleteAll: global.__mockPromise()
        };

        const mockCachesService: Mockify<ICachesService> = {
            getCache: jest.fn().mockReturnValue(mockCacheService)
        };

        const mockTasksManagerDomain: Mockify<ITasksManagerDomain> = {
            createTask: global.__mockPromise(),
            updateProgress: global.__mockPromise()
        };

        const mockUpdateTaskProgress: Mockify<UpdateTaskProgress> = global.__mockPromise();

        const imprtDomain = importDomain({
            config: mockConfig as Config.IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.domain.value': mockValueDomain as IValueDomain,
            'core.infra.cache.cacheService': mockCachesService as ICachesService,
            'core.domain.tasksManager': mockTasksManagerDomain as ITasksManagerDomain,
            'core.domain.helpers.updateTaskProgress': mockUpdateTaskProgress as UpdateTaskProgress,
            translator: mockTranslator as i18n
        });

        try {
            await imprtDomain.import('test.json', ctx, {id: 'fakeTaskId'});
        } finally {
            // Delete remaining import file.
            await fs.promises.unlink(`${mockConfig.import.directory}/test.json`);
        }

        expect(mockRecordDomain.createRecord.mock.calls.length).toBe(1);
        expect(mockRecordDomain.find.mock.calls.length).toBe(1);
        expect(mockAttrDomain.getLibraryAttributes.mock.calls.length).toBe(1);
        expect(mockValidateHelper.validateLibrary.mock.calls.length).toBe(1);
        expect(mockValueDomain.saveValue.mock.calls.length).toBe(1);
    });

    test('test import trees', async () => {
        const data = {
            elements: [],
            trees: [
                {
                    library: 'users_groups',
                    treeId: 'users_groups',
                    matches: [
                        {
                            attribute: 'simple',
                            value: 'test'
                        }
                    ],
                    action: Action.UPDATE
                }
            ]
        };

        await fs.promises.writeFile(`${mockConfig.import.directory}/test.json`, JSON.stringify(data));

        const mockTreeDomain: Mockify<ITreeDomain> = {
            isRecordPresent: global.__mockPromise(false),
            addElement: global.__mockPromise(),
            getNodesByRecord: global.__mockPromise([])
        };

        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: global.__mockPromise({totalCount: 1, list: [{id: '123'}]})
        };

        const mockValidateHelper: Mockify<IValidateHelper> = {
            validateLibrary: global.__mockPromise()
        };

        const mockCacheService: Mockify<ICacheService> = {
            getData: global.__mockPromise(),
            storeData: global.__mockPromise(),
            deleteAll: global.__mockPromise()
        };

        const mockCachesService: Mockify<ICachesService> = {
            getCache: jest.fn().mockReturnValue(mockCacheService)
        };

        const mockTasksManagerDomain: Mockify<ITasksManagerDomain> = {
            createTask: global.__mockPromise(),
            updateProgress: global.__mockPromise()
        };

        const mockUpdateTaskProgress: Mockify<UpdateTaskProgress> = global.__mockPromise();

        const imprtDomain = importDomain({
            config: mockConfig as Config.IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.tree': mockTreeDomain as ITreeDomain,
            'core.infra.cache.cacheService': mockCachesService as ICachesService,
            'core.domain.tasksManager': mockTasksManagerDomain as ITasksManagerDomain,
            'core.domain.helpers.updateTaskProgress': mockUpdateTaskProgress as UpdateTaskProgress,
            translator: mockTranslator as i18n
        });

        try {
            await imprtDomain.import('test.json', ctx, {id: 'fakeTaskId'});
        } finally {
            // Delete remaining import file.
            await fs.promises.unlink(`${mockConfig.import.directory}/test.json`);
        }

        expect(mockRecordDomain.find.mock.calls.length).toBe(1);
        expect(mockValidateHelper.validateLibrary.mock.calls.length).toBe(1);
        expect(mockTreeDomain.getNodesByRecord.mock.calls.length).toBe(1);
        expect(mockTreeDomain.addElement.mock.calls.length).toBe(1);
    });

    test('test import elements - Upsert mode', async () => {
        const data = {
            elements: [
                {
                    library: 'test_import',
                    matches: [{attribute: 'id', value: 'existingId'}],
                    mode: ImportMode.UPSERT,
                    data: [{attribute: 'simple', values: [{value: 'one'}], action: Action.ADD}],
                    links: []
                },
                {
                    library: 'test_import',
                    matches: [{attribute: 'id', value: 'nonExistingId'}],
                    mode: ImportMode.UPSERT,
                    data: [{attribute: 'simple', values: [{value: 'one'}], action: Action.ADD}],
                    links: []
                }
            ],
            trees: []
        };

        await fs.promises.writeFile(`${mockConfig.import.directory}/test.json`, JSON.stringify(data));

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise([{id: 'simple'}])
        };

        const mockValueDomain: Mockify<IValueDomain> = {
            saveValue: global.__mockPromise([]),
            getValues: global.__mockPromise([])
        };

        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: jest.fn().mockImplementation(({params}) => {
                if (params.filters[0].value === 'existingId') {
                    return {totalCount: 1, list: [{id: 'existingId'}]};
                } else {
                    return {totalCount: 0, list: []};
                }
            }),
            createRecord: global.__mockPromise({id: '1'})
        };

        const mockValidateHelper: Mockify<IValidateHelper> = {validateLibrary: global.__mockPromise()};

        const mockCacheService: Mockify<ICacheService> = {
            getData: global.__mockPromise(),
            storeData: global.__mockPromise(),
            deleteAll: global.__mockPromise()
        };

        const mockCachesService: Mockify<ICachesService> = {getCache: jest.fn().mockReturnValue(mockCacheService)};

        const mockTasksManagerDomain: Mockify<ITasksManagerDomain> = {
            createTask: global.__mockPromise(),
            updateProgress: global.__mockPromise()
        };

        const mockUpdateTaskProgress: Mockify<UpdateTaskProgress> = global.__mockPromise();

        const imprtDomain = importDomain({
            config: mockConfig as Config.IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.domain.value': mockValueDomain as IValueDomain,
            'core.infra.cache.cacheService': mockCachesService as ICachesService,
            'core.domain.tasksManager': mockTasksManagerDomain as ITasksManagerDomain,
            'core.domain.helpers.updateTaskProgress': mockUpdateTaskProgress as UpdateTaskProgress,
            translator: mockTranslator as i18n
        });

        await imprtDomain.import('test.json', ctx, {id: 'fakeTaskId'});

        expect(mockRecordDomain.find).toBeCalledTimes(2);
        expect(mockRecordDomain.createRecord).toBeCalledTimes(1);
        expect(mockValueDomain.saveValue).toBeCalledTimes(2);

        // Delete remaining import file.
        await fs.promises.unlink(`${mockConfig.import.directory}/test.json`);
    });

    test('test import elements - Insert mode', async () => {
        const data = {
            elements: [
                {
                    library: 'test_import',
                    matches: [{attribute: 'id', value: 'existingId'}],
                    mode: ImportMode.INSERT,
                    data: [{attribute: 'simple', values: [{value: 'one'}], action: Action.ADD}],
                    links: []
                },
                {
                    library: 'test_import',
                    matches: [{attribute: 'id', value: 'nonExistingId'}],
                    mode: ImportMode.INSERT,
                    data: [{attribute: 'simple', values: [{value: 'one'}], action: Action.ADD}],
                    links: []
                }
            ],
            trees: []
        };

        await fs.promises.writeFile(`${mockConfig.import.directory}/test.json`, JSON.stringify(data));

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise([{id: 'simple'}])
        };

        const mockValueDomain: Mockify<IValueDomain> = {
            saveValue: global.__mockPromise([]),
            getValues: global.__mockPromise([])
        };

        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: jest.fn().mockImplementation(({params}) => {
                if (params.filters[0].value === 'existingId') {
                    return {totalCount: 1, list: [{id: 'existingId'}]};
                } else {
                    return {totalCount: 0, list: []};
                }
            }),
            createRecord: global.__mockPromise({id: '1'})
        };

        const mockValidateHelper: Mockify<IValidateHelper> = {validateLibrary: global.__mockPromise()};

        const mockCacheService: Mockify<ICacheService> = {
            getData: global.__mockPromise(),
            storeData: global.__mockPromise(),
            deleteAll: global.__mockPromise()
        };

        const mockCachesService: Mockify<ICachesService> = {getCache: jest.fn().mockReturnValue(mockCacheService)};

        const mockTasksManagerDomain: Mockify<ITasksManagerDomain> = {
            createTask: global.__mockPromise(),
            updateProgress: global.__mockPromise()
        };

        const mockUpdateTaskProgress: Mockify<UpdateTaskProgress> = global.__mockPromise();

        const imprtDomain = importDomain({
            config: mockConfig as Config.IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.domain.value': mockValueDomain as IValueDomain,
            'core.infra.cache.cacheService': mockCachesService as ICachesService,
            'core.domain.tasksManager': mockTasksManagerDomain as ITasksManagerDomain,
            'core.domain.helpers.updateTaskProgress': mockUpdateTaskProgress as UpdateTaskProgress,
            translator: mockTranslator as i18n
        });

        await imprtDomain.import('test.json', ctx, {id: 'fakeTaskId'});

        expect(mockRecordDomain.find).toBeCalledTimes(2);
        expect(mockRecordDomain.createRecord).toBeCalledTimes(1);
        expect(mockValueDomain.saveValue).toBeCalledTimes(1);

        // Delete remaining import file.
        await fs.promises.unlink(`${mockConfig.import.directory}/test.json`);
    });

    test('test import elements - Update mode', async () => {
        const data = {
            elements: [
                {
                    library: 'test_import',
                    matches: [{attribute: 'id', value: 'existingId'}],
                    mode: ImportMode.UPDATE,
                    data: [{attribute: 'simple', values: [{value: 'one'}], action: Action.ADD}],
                    links: []
                },
                {
                    library: 'test_import',
                    matches: [{attribute: 'id', value: 'nonExistingId'}],
                    mode: ImportMode.UPDATE,
                    data: [{attribute: 'simple', values: [{value: 'one'}], action: Action.ADD}],
                    links: []
                }
            ],
            trees: []
        };

        await fs.promises.writeFile(`${mockConfig.import.directory}/test.json`, JSON.stringify(data));

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise([{id: 'simple'}])
        };

        const mockValueDomain: Mockify<IValueDomain> = {
            saveValue: global.__mockPromise([]),
            getValues: global.__mockPromise([])
        };

        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: jest.fn().mockImplementation(({params}) => {
                if (params.filters[0].value === 'existingId') {
                    return {totalCount: 1, list: [{id: 'existingId'}]};
                } else {
                    return {totalCount: 0, list: []};
                }
            }),
            createRecord: global.__mockPromise({id: '1'})
        };

        const mockValidateHelper: Mockify<IValidateHelper> = {validateLibrary: global.__mockPromise()};

        const mockCacheService: Mockify<ICacheService> = {
            getData: global.__mockPromise(),
            storeData: global.__mockPromise(),
            deleteAll: global.__mockPromise()
        };

        const mockCachesService: Mockify<ICachesService> = {getCache: jest.fn().mockReturnValue(mockCacheService)};

        const mockTasksManagerDomain: Mockify<ITasksManagerDomain> = {
            createTask: global.__mockPromise(),
            updateProgress: global.__mockPromise()
        };

        const mockUpdateTaskProgress: Mockify<UpdateTaskProgress> = global.__mockPromise();

        const imprtDomain = importDomain({
            config: mockConfig as Config.IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.domain.value': mockValueDomain as IValueDomain,
            'core.infra.cache.cacheService': mockCachesService as ICachesService,
            'core.domain.tasksManager': mockTasksManagerDomain as ITasksManagerDomain,
            'core.domain.helpers.updateTaskProgress': mockUpdateTaskProgress as UpdateTaskProgress,
            translator: mockTranslator as i18n
        });

        await imprtDomain.import('test.json', ctx, {id: 'fakeTaskId'});

        expect(mockRecordDomain.find).toBeCalledTimes(2);
        expect(mockRecordDomain.createRecord).not.toBeCalled();
        expect(mockValueDomain.saveValue).toBeCalledTimes(1);

        // Delete remaining import file.
        await fs.promises.unlink(`${mockConfig.import.directory}/test.json`);
    });
});
