// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import importDomain from './importDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValidateHelper} from 'domain/helpers/validate';
import {IValueDomain} from 'domain/value/valueDomain';
import {IQueryInfos} from '_types/queryInfos';
import {Action} from '../../_types/import';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ICacheService} from 'infra/cache/cacheService';
import * as Config from '_types/config';
import fs from 'fs';
import {appRootPath} from '@leav/app-root-path';
import path from 'path';
import {when} from 'jest-when';

const importMockConfig: Mockify<Config.IImport> = {
    directory: path.resolve(__dirname, './imports'),
    sizeLimit: 100,
    groupData: 50
};

const mockConfig: Mockify<Config.IConfig> = {
    import: importMockConfig as Config.IImport
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
        const imprtDomain = importDomain({config: mockConfig as Config.IConfig});

        expect(imprtDomain.import('kzdidnzj', ctx)).rejects.toThrow();
    });

    test('test import elements - simple and advanced links', async () => {
        const data = {
            elements: [
                {
                    library: 'test_import',
                    matches: [],
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
            getData: global.__mockPromise(),
            storeData: global.__mockPromise(),
            deleteAll: global.__mockPromise()
        };

        when(mockCacheService.getData)
            .calledWith('test.json-links', '0')
            .mockReturnValue(
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
            );

        when(mockCacheService.getData)
            .calledWith('test.json-links', '1')
            .mockReturnValue(
                JSON.stringify({
                    library: 'users_groups',
                    recordIds: ['1'],
                    links: []
                })
            );

        const imprtDomain = importDomain({
            config: mockConfig as Config.IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.domain.value': mockValueDomain as IValueDomain,
            'core.infra.cache.cacheService': mockCacheService as ICacheService
        });

        await imprtDomain.import('test.json', ctx);

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
            getData: global.__mockPromise(
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
            ),
            storeData: global.__mockPromise(),
            deleteAll: global.__mockPromise()
        };

        const imprtDomain = importDomain({
            config: mockConfig as Config.IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.domain.value': mockValueDomain as IValueDomain,
            'core.infra.cache.cacheService': mockCacheService as ICacheService
        });

        try {
            await imprtDomain.import('test.json', ctx);
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
            isElementPresent: global.__mockPromise(false),
            addElement: global.__mockPromise()
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

        const imprtDomain = importDomain({
            config: mockConfig as Config.IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.tree': mockTreeDomain as ITreeDomain,
            'core.infra.cache.cacheService': mockCacheService as ICacheService
        });

        try {
            await imprtDomain.import('test.json', ctx);
        } finally {
            // Delete remaining import file.
            await fs.promises.unlink(`${mockConfig.import.directory}/test.json`);
        }

        expect(mockRecordDomain.find.mock.calls.length).toBe(1);
        expect(mockValidateHelper.validateLibrary.mock.calls.length).toBe(1);
        expect(mockTreeDomain.isElementPresent.mock.calls.length).toBe(1);
        expect(mockTreeDomain.addElement.mock.calls.length).toBe(1);
    });
});
