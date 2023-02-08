// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import * as amqp from 'amqplib';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {i18n} from 'i18next';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {LibraryBehavior} from '../../_types/library';
import {AttributeCondition, Operator} from '../../_types/record';
import {mockLibraryFiles} from '../../__tests__/mocks/library';
import {mockRecord} from '../../__tests__/mocks/record';
import {mockTranslator} from '../../__tests__/mocks/translator';
import {mockFilesTree} from '../../__tests__/mocks/tree';
import filesManager from './filesManagerDomain';
import {createPreview} from './helpers/handlePreview';
import {systemPreviewVersions} from './_constants';
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
        userId: '0',
        userGroupsIds: '1'
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

    const mockLibraryDomain: Mockify<ILibraryDomain> = {
        getLibraryProperties: global.__mockPromise(mockLibraryFiles)
    };

    const mockAmqpService: Mockify<IAmqpService> = {
        consume: jest.fn(),
        consumer: {
            connection: mockAmqpConnection as amqp.Connection,
            channel: mockAmqpChannel as amqp.ConfirmChannel
        }
    };

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

        expect(mockAmqpService.consume).toBeCalled();
        expect(mockAmqpService.consumer.channel.assertQueue).toBeCalled();
        expect(mockAmqpService.consumer.channel.bindQueue).toBeCalled();
    });

    describe('forcePreviewsGeneration', () => {
        test('Force preview generation one file', async () => {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    cursor: {},
                    totalCount: 1,
                    list: [{id: 'id', file_path: 'file_path', file_name: 'file_name', library: mockLibraryFiles.id}]
                })
            };

            const files = filesManager({
                config: mockConfig as Config.IConfig,
                'core.utils.logger': logger as winston.Winston,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.infra.amqpService': mockAmqpService as IAmqpService
            });

            await files.forcePreviewsGeneration({ctx, libraryId: 'libraryId', recordIds: ['id']});

            expect(mockRecordDomain.find.mock.calls[0][0].params.filters).toEqual([
                {field: 'id', value: 'id', condition: AttributeCondition.EQUAL}
            ]);
            expect(createPreview).toBeCalledTimes(1);

            expect(createPreview).toBeCalledWith(
                'id',
                'file_path/file_name',
                mockLibraryFiles.id,
                systemPreviewVersions,
                mockAmqpService,
                mockConfig
            );
        });

        test('Force preview generation multiple files', async () => {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    cursor: {},
                    totalCount: 1,
                    list: [
                        {id: 'id1', file_path: 'file_path', file_name: 'file_name1', library: mockLibraryFiles.id},
                        {id: 'id2', file_path: 'file_path', file_name: 'file_name2', library: mockLibraryFiles.id},
                        {id: 'id3', file_path: 'file_path', file_name: 'file_name3', library: mockLibraryFiles.id}
                    ]
                })
            };

            const files = filesManager({
                config: mockConfig as Config.IConfig,
                'core.utils.logger': logger as winston.Winston,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.infra.amqpService': mockAmqpService as IAmqpService
            });

            await files.forcePreviewsGeneration({ctx, libraryId: 'libraryId', recordIds: ['id1', 'id2', 'id3']});

            expect(mockRecordDomain.find.mock.calls[0][0].params.filters).toEqual([
                {field: 'id', value: 'id1', condition: AttributeCondition.EQUAL},
                {operator: Operator.OR},
                {field: 'id', value: 'id2', condition: AttributeCondition.EQUAL},
                {operator: Operator.OR},
                {field: 'id', value: 'id3', condition: AttributeCondition.EQUAL}
            ]);
            expect(createPreview).toBeCalledTimes(3);
        });

        test('Force preview generation one directory', async () => {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    cursor: {},
                    totalCount: 1,
                    list: [{id: 'id', file_path: 'dir_path', file_name: 'file_name'}]
                })
            };

            const mockTreeDomain: Mockify<ITreeDomain> = {
                getTrees: global.__mockPromise({
                    list: [
                        {
                            ...mockFilesTree
                        }
                    ]
                }),
                getTreeContent: global.__mockPromise([
                    {
                        record: {
                            id: 'file1',
                            file_path: 'file_path_1',
                            file_name: 'file_name_1',
                            library: 'lib2'
                        }
                    },
                    {
                        record: {
                            id: 'file2',
                            file_path: 'file_path_2',
                            file_name: 'file_name_2',
                            library: 'lib2'
                        }
                    }
                ]),
                getNodesByRecord: global.__mockPromise({
                    id: '12345',
                    record: {
                        id: 'file1',
                        file_path: 'file_path_1',
                        file_name: 'file_name_1',
                        library: mockLibraryFiles.id
                    }
                })
            };

            const mockLibraryDomainForDirectories: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn(id => {
                    return id === 'lib2'
                        ? {...mockLibraryFiles, id}
                        : {...mockLibraryFiles, id, behavior: LibraryBehavior.DIRECTORIES};
                })
            };

            const files = filesManager({
                config: mockConfig as Config.IConfig,
                'core.utils.logger': logger as winston.Winston,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.library': mockLibraryDomainForDirectories as ILibraryDomain,
                'core.infra.amqpService': mockAmqpService as IAmqpService,
                'core.domain.tree': mockTreeDomain as ITreeDomain
            });

            await files.forcePreviewsGeneration({ctx, libraryId: 'directoriesLibrary', recordIds: ['id']});

            expect(createPreview).toBeCalledTimes(2);

            expect(createPreview).toHaveBeenNthCalledWith(
                1,
                'file1',
                'file_path_1/file_name_1',
                'lib2',
                systemPreviewVersions,
                mockAmqpService,
                mockConfig
            );

            expect(createPreview).toHaveBeenNthCalledWith(
                2,
                'file2',
                'file_path_2/file_name_2',
                'lib2',
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
                        {id: 'file1', file_path: 'file_path_1', file_name: 'file_name_1', library: mockLibraryFiles.id},
                        {id: 'file2', file_path: 'file_path_2', file_name: 'file_name_2', library: mockLibraryFiles.id}
                    ]
                })
            };

            const files = filesManager({
                config: mockConfig as Config.IConfig,
                'core.utils.logger': logger as winston.Winston,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.infra.amqpService': mockAmqpService as IAmqpService
            });

            await files.forcePreviewsGeneration({ctx, libraryId: 'libraryId'});

            expect(createPreview).toBeCalledTimes(2);

            expect(createPreview).toHaveBeenNthCalledWith(
                1,
                'file1',
                'file_path_1/file_name_1',
                mockLibraryFiles.id,
                systemPreviewVersions,
                mockAmqpService,
                mockConfig
            );

            expect(createPreview).toHaveBeenNthCalledWith(
                2,
                'file2',
                'file_path_2/file_name_2',
                mockLibraryFiles.id,
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
                            file_path: 'file_path_1',
                            file_name: 'file_name_1',
                            library: mockLibraryFiles.id,
                            previews_status: [{status: 0, message: 'msg'}]
                        },
                        {
                            id: 'file2',
                            file_path: 'file_path_2',
                            file_name: 'file_name_2',
                            library: mockLibraryFiles.id,
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
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.infra.amqpService': mockAmqpService as IAmqpService
            });

            await files.forcePreviewsGeneration({ctx, libraryId: 'libraryId', failedOnly: true});

            expect(createPreview).toBeCalledTimes(1);

            expect(createPreview).toHaveBeenCalledWith(
                'file2',
                'file_path_2/file_name_2',
                mockLibraryFiles.id,
                systemPreviewVersions,
                mockAmqpService,
                mockConfig
            );
        });

        test('Force preview generation with filters', async () => {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    cursor: {},
                    totalCount: 1,
                    list: [
                        {
                            id: 'file1',
                            file_path: 'file_path_1',
                            file_name: 'file_name_1',
                            library: mockLibraryFiles.id,
                            previews_status: [{status: 0, message: 'msg'}]
                        }
                    ]
                })
            };

            const files = filesManager({
                config: mockConfig as Config.IConfig,
                'core.utils.logger': logger as winston.Winston,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.infra.amqpService': mockAmqpService as IAmqpService
            });

            await files.forcePreviewsGeneration({
                ctx,
                libraryId: 'libraryId',
                filters: [
                    {
                        field: 'file_name',
                        condition: AttributeCondition.EQUAL,
                        value: 'file_name_1'
                    }
                ]
            });

            expect(mockRecordDomain.find).toBeCalledTimes(1);
            expect(mockRecordDomain.find.mock.calls[0][0].params.filters).toEqual([
                {
                    field: 'file_name',
                    condition: AttributeCondition.EQUAL,
                    value: 'file_name_1'
                }
            ]);

            expect(createPreview).toBeCalledTimes(1);
            expect(createPreview).toHaveBeenCalledWith(
                'file1',
                'file_path_1/file_name_1',
                mockLibraryFiles.id,
                systemPreviewVersions,
                mockAmqpService,
                mockConfig
            );
        });
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
