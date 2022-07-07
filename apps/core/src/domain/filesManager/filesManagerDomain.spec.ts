// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {i18n} from 'i18next';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {mockRecord} from '../../__tests__/mocks/record';
import {mockTranslator} from '../../__tests__/mocks/translator';
import {IAmqpService, amqpService} from '@leav/message-broker';
import filesManager, {systemPreviewVersions} from './filesManagerDomain';
import {createPreview} from './helpers/handlePreview';
import winston = require('winston');

const mockConfig: Mockify<Config.IConfig> = {
    amqp: {
        connOpt: {},
        type: 'direct',
        exchange: 'test_leav_core'
    },
    filesManager: {
        queues: {
            events: 'files_events',
            previewRequest: 'preview_request',
            previewResponse: 'preview_response'
        },
        routingKeys: {
            events: 'files.event',
            previewRequest: 'files.previewRequest',
            previewResponse: 'files.previewResponse'
        },
        rootKeys: {
            files1: 'files'
        },
        userId: '0'
    }
};

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    assertExchange: jest.fn(),
    checkExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    publish: jest.fn(),
    waitForConfirms: jest.fn(),
    prefetch: jest.fn()
};

const mockAmqpConnection: Mockify<amqp.Connection> = {
    close: jest.fn(),
    createConfirmChannel: jest.fn().mockReturnValue(mockAmqpChannel)
};

jest.mock('amqplib', () => ({
    connect: jest.fn().mockImplementation(() => mockAmqpConnection)
}));

let mockAmqpService;

const logger: Mockify<winston.Winston> = {
    error: jest.fn((...args) => console.log(args)), // eslint-disable-line no-restricted-syntax
    warn: jest.fn((...args) => console.log(args)) // eslint-disable-line no-restricted-syntax
};

jest.mock('./helpers/handlePreview', () => ({
    createPreview: jest.fn()
}));

describe('FilesManager', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'filesManagerTest'
    };

    beforeAll(async done => {
        mockAmqpService = await amqpService({
            config: mockConfig.amqp
        });

        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Init', async () => {
        const files = filesManager({
            config: mockConfig as Config.IConfig,
            'core.utils.logger': logger as winston.Winston,
            'core.infra.amqpService': mockAmqpService as IAmqpService
        });

        await files.init();

        expect(mockAmqpChannel.consume).toBeCalled();
        expect(mockAmqpChannel.assertQueue).toBeCalled();
        expect(mockAmqpChannel.bindQueue).toBeCalled();
    });

    test('Force preview generation one file', async () => {
        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: global.__mockPromise({
                cursor: {},
                totalCount: 1,
                list: [{id: 'id', is_directory: false, file_path: 'file_path', file_name: 'file_name'}]
            })
        };

        const files = filesManager({
            config: mockConfig as Config.IConfig,
            'core.utils.logger': logger as winston.Winston,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.infra.amqpService': mockAmqpService as IAmqpService
        });

        await files.forcePreviewsGeneration({ctx, libraryId: 'libraryId', recordId: 'id'});

        expect(createPreview).toBeCalledTimes(1);

        expect(createPreview).toBeCalledWith(
            'id',
            'file_path/file_name',
            'libraryId',
            systemPreviewVersions,
            mockAmqpService,
            mockConfig
        );
    });

    test('Force preview generation one directory', async () => {
        const mockUtils: Mockify<IUtils> = {
            getLibraryTreeId: jest.fn(() => 'files_tree')
        };

        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: global.__mockPromise({
                cursor: {},
                totalCount: 1,
                list: [{id: 'id', is_directory: true, file_path: 'dir_path', file_name: 'file_name'}]
            })
        };

        const mockTreeDomain: Mockify<ITreeDomain> = {
            getTreeContent: global.__mockPromise([
                {record: {id: 'file1', is_directory: false, file_path: 'file_path_1', file_name: 'file_name_1'}},
                {record: {id: 'file2', is_directory: false, file_path: 'file_path_2', file_name: 'file_name_2'}}
            ]),
            getNodesByRecord: global.__mockPromise({
                id: '12345',
                record: {id: 'file1', is_directory: false, file_path: 'file_path_1', file_name: 'file_name_1'}
            })
        };

        const files = filesManager({
            config: mockConfig as Config.IConfig,
            'core.utils.logger': logger as winston.Winston,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.infra.amqpService': mockAmqpService as IAmqpService,
            'core.domain.tree': mockTreeDomain as ITreeDomain,
            'core.utils': mockUtils as IUtils
        });

        await files.forcePreviewsGeneration({ctx, libraryId: 'libraryId', recordId: 'id'});

        expect(createPreview).toBeCalledTimes(2);

        expect(createPreview).toHaveBeenNthCalledWith(
            1,
            'file1',
            'file_path_1/file_name_1',
            'libraryId',
            systemPreviewVersions,
            mockAmqpService,
            mockConfig
        );

        expect(createPreview).toHaveBeenNthCalledWith(
            2,
            'file2',
            'file_path_2/file_name_2',
            'libraryId',
            systemPreviewVersions,
            mockAmqpService,
            mockConfig
        );
    });

    test('Force preview generation full library', async () => {
        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: global.__mockPromise({
                cursor: {},
                totalCount: 1,
                list: [
                    {id: 'id', is_directory: true, file_path: 'dir_path', file_name: 'file_name'},
                    {id: 'file1', is_directory: false, file_path: 'file_path_1', file_name: 'file_name_1'},
                    {id: 'file2', is_directory: false, file_path: 'file_path_2', file_name: 'file_name_2'}
                ]
            })
        };

        const files = filesManager({
            config: mockConfig as Config.IConfig,
            'core.utils.logger': logger as winston.Winston,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.infra.amqpService': mockAmqpService as IAmqpService
        });

        await files.forcePreviewsGeneration({ctx, libraryId: 'libraryId'});

        expect(createPreview).toBeCalledTimes(2);

        expect(createPreview).toHaveBeenNthCalledWith(
            1,
            'file1',
            'file_path_1/file_name_1',
            'libraryId',
            systemPreviewVersions,
            mockAmqpService,
            mockConfig
        );

        expect(createPreview).toHaveBeenNthCalledWith(
            2,
            'file2',
            'file_path_2/file_name_2',
            'libraryId',
            systemPreviewVersions,
            mockAmqpService,
            mockConfig
        );
    });

    test('Force preview generation with failedOnly', async () => {
        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: global.__mockPromise({
                cursor: {},
                totalCount: 1,
                list: [
                    {
                        id: 'file1',
                        is_directory: false,
                        file_path: 'file_path_1',
                        file_name: 'file_name_1',
                        previews_status: [{status: 0, message: 'msg'}]
                    },
                    {
                        id: 'file2',
                        is_directory: false,
                        file_path: 'file_path_2',
                        file_name: 'file_name_2',
                        previews_status: [
                            {status: -1, message: 'msg'},
                            {status: 0, message: 'msg'}
                        ]
                    }
                ]
            })
        };

        const files = filesManager({
            config: mockConfig as Config.IConfig,
            'core.utils.logger': logger as winston.Winston,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.infra.amqpService': mockAmqpService as IAmqpService
        });

        await files.forcePreviewsGeneration({ctx, libraryId: 'libraryId', failedOnly: true});

        expect(createPreview).toBeCalledTimes(1);

        expect(createPreview).toHaveBeenCalledWith(
            'file2',
            'file_path_2/file_name_2',
            'libraryId',
            systemPreviewVersions,
            mockAmqpService,
            mockConfig
        );
    });

    describe('getRootPathByKey', () => {
        test('Return path by key', async () => {
            const mockConfigWithPaths = {
                ...mockConfig,
                files: {
                    rootPaths: 'key1:path1, key2: path2 , key3 : path3 '
                }
            };

            const files = filesManager({
                config: mockConfigWithPaths as Config.IConfig
            });

            expect(files.getRootPathByKey('key1')).toBe('path1');
            expect(files.getRootPathByKey('key2')).toBe('path2');
            expect(files.getRootPathByKey('key3')).toBe('path3');
            expect(() => files.getRootPathByKey('keyUnknown')).toThrow(Error);
        });
    });

    describe('getOriginalPath', () => {
        test('Retrieve original path', async () => {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    list: [
                        {
                            ...mockRecord,
                            file_path: '/path/to/file',
                            file_name: 'myFile.mp4',
                            rootKey: 'key1'
                        }
                    ]
                })
            };

            const files = filesManager({
                config: mockConfig as Config.IConfig,
                'core.domain.record': mockRecordDomain as IRecordDomain
            });
            files.getRootPathByKey = jest.fn(() => '/rootPath');

            const originalPath = await files.getOriginalPath({ctx, libraryId: 'libraryId', fileId: '123456'});

            expect(originalPath).toBe('/rootPath/path/to/file/myFile.mp4');
        });

        test('Throws if file does not exist', async () => {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    list: []
                })
            };

            const files = filesManager({
                config: mockConfig as Config.IConfig,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                translator: mockTranslator as i18n
            });
            files.getRootPathByKey = jest.fn(() => '/rootPath');

            await expect(files.getOriginalPath({ctx, libraryId: 'libraryId', fileId: '123456'})).rejects.toThrow(
                ValidationError
            );
        });
    });
});
