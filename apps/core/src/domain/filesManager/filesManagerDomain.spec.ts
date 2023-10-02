// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import {PreviewPriority} from '@leav/utils';
import * as amqp from 'amqplib';
import {CreateDirectoryFunc} from 'domain/helpers/createDirectory';
import {StoreUploadFileFunc} from 'domain/helpers/storeUploadFile';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {ILibraryPermissionDomain} from 'domain/permission/libraryPermissionDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {i18n} from 'i18next';
import {IRecordRepo} from 'infra/record/recordRepo';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import ValidationError from '../../errors/ValidationError';
import {LibraryBehavior} from '../../_types/library';
import {IQueryInfos} from '../../_types/queryInfos';
import {AttributeCondition, Operator} from '../../_types/record';
import {mockLibrary, mockLibraryDirectories, mockLibraryFiles} from '../../__tests__/mocks/library';
import {mockFileRecord, mockRecord} from '../../__tests__/mocks/record';
import {mockTranslator} from '../../__tests__/mocks/translator';
import {mockFilesTree, mockTree} from '../../__tests__/mocks/tree';
import filesManager, {IStoreFilesParams} from './filesManagerDomain';
import {requestPreviewGeneration} from './helpers/handlePreview';
import {systemPreviewsSettings} from './_constants';
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
        userGroupsIds: '1',
        allowFilesList: '',
        ignoreFilesList: ''
    },
    files: {
        rootPaths: 'files1:/files',
        originalsPathPrefix: 'originals'
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
    info: jest.fn((...args) => console.log(args)), // eslint-disable-line no-restricted-syntax
    error: jest.fn((...args) => console.log(args)), // eslint-disable-line no-restricted-syntax
    warn: jest.fn((...args) => console.log(args)) // eslint-disable-line no-restricted-syntax
};

jest.mock('./helpers/handlePreview', () => ({
    requestPreviewGeneration: jest.fn()
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

    const mockTreeDomain: Mockify<ITreeDomain> = {
        getNodesByRecord: jest.fn()
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Init', async () => {
        const files = filesManager({
            config: mockConfig as Config.IConfig,
            'core.utils.logger': logger as winston.Winston,
            'core.infra.amqpService': mockAmqpService as IAmqpService,
            'core.domain.tree': mockTreeDomain as ITreeDomain
        });

        await files.init();

        expect(mockAmqpService.consume).toBeCalled();
        expect(mockAmqpService.consumer.channel.assertQueue).toBeCalled();
        expect(mockAmqpService.consumer.channel.bindQueue).toBeCalled();
    });

    describe('forcePreviewsGeneration', () => {
        const mockRecordRepo: Mockify<IRecordRepo> = {
            updateRecord: jest.fn()
        };

        const mockUtils: Mockify<IUtils> = {
            getPreviewsAttributeName: jest.fn().mockReturnValue('previews'),
            getPreviewsStatusAttributeName: jest.fn().mockReturnValue('previews_status'),
            getPreviewAttributesSettings: jest.fn().mockReturnValue(systemPreviewsSettings),
            previewsSettingsToVersions: jest.fn().mockReturnValue(systemPreviewsSettings)
        };

        const mockUpdateLastRecordModif = jest.fn();
        const mockSendRecordUpdate = jest.fn();

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
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': logger as winston.Winston,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.helpers.updateRecordLastModif': mockUpdateLastRecordModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdate,
                'core.infra.amqpService': mockAmqpService as IAmqpService,
                'core.infra.record': mockRecordRepo as IRecordRepo
            });

            await files.forcePreviewsGeneration({ctx, libraryId: 'libraryId', recordIds: ['id']});

            expect(mockRecordDomain.find.mock.calls[0][0].params.filters).toEqual([
                {field: 'id', value: 'id', condition: AttributeCondition.EQUAL}
            ]);
            expect(requestPreviewGeneration).toBeCalledTimes(1);

            expect(requestPreviewGeneration).toBeCalledWith({
                recordId: 'id',
                pathAfter: 'file_path/file_name',
                libraryId: mockLibraryFiles.id,
                priority: PreviewPriority.MEDIUM,
                versions: systemPreviewsSettings,
                deps: {amqpService: mockAmqpService, config: mockConfig, logger}
            });
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
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': logger as winston.Winston,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.helpers.updateRecordLastModif': mockUpdateLastRecordModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdate,
                'core.infra.amqpService': mockAmqpService as IAmqpService,
                'core.infra.record': mockRecordRepo as IRecordRepo
            });

            await files.forcePreviewsGeneration({ctx, libraryId: 'libraryId', recordIds: ['id1', 'id2', 'id3']});

            expect(mockRecordDomain.find.mock.calls[0][0].params.filters).toEqual([
                {field: 'id', value: 'id1', condition: AttributeCondition.EQUAL},
                {operator: Operator.OR},
                {field: 'id', value: 'id2', condition: AttributeCondition.EQUAL},
                {operator: Operator.OR},
                {field: 'id', value: 'id3', condition: AttributeCondition.EQUAL}
            ]);
            expect(requestPreviewGeneration).toBeCalledTimes(3);
        });

        test('Force preview generation one directory', async () => {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    cursor: {},
                    totalCount: 1,
                    list: [{id: 'id', file_path: 'dir_path', file_name: 'file_name'}]
                })
            };

            const mockTreeDomainSpecific: Mockify<ITreeDomain> = {
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
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': logger as winston.Winston,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.library': mockLibraryDomainForDirectories as ILibraryDomain,
                'core.domain.tree': mockTreeDomainSpecific as ITreeDomain,
                'core.domain.helpers.updateRecordLastModif': mockUpdateLastRecordModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdate,
                'core.infra.amqpService': mockAmqpService as IAmqpService,
                'core.infra.record': mockRecordRepo as IRecordRepo
            });

            await files.forcePreviewsGeneration({ctx, libraryId: 'directoriesLibrary', recordIds: ['id']});

            expect(requestPreviewGeneration).toBeCalledTimes(2);

            expect(requestPreviewGeneration).toHaveBeenNthCalledWith(1, {
                recordId: 'file1',
                pathAfter: 'file_path_1/file_name_1',
                libraryId: 'lib2',
                priority: PreviewPriority.MEDIUM,
                versions: systemPreviewsSettings,
                deps: {amqpService: mockAmqpService, config: mockConfig, logger}
            });

            expect(requestPreviewGeneration).toHaveBeenNthCalledWith(2, {
                recordId: 'file2',
                pathAfter: 'file_path_2/file_name_2',
                libraryId: 'lib2',
                priority: PreviewPriority.MEDIUM,
                versions: systemPreviewsSettings,
                deps: {amqpService: mockAmqpService, config: mockConfig, logger}
            });
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
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': logger as winston.Winston,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.helpers.updateRecordLastModif': mockUpdateLastRecordModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdate,
                'core.infra.amqpService': mockAmqpService as IAmqpService,
                'core.infra.record': mockRecordRepo as IRecordRepo
            });

            await files.forcePreviewsGeneration({ctx, libraryId: 'libraryId'});

            expect(requestPreviewGeneration).toBeCalledTimes(2);

            expect(requestPreviewGeneration).toHaveBeenNthCalledWith(1, {
                recordId: 'file1',
                pathAfter: 'file_path_1/file_name_1',
                libraryId: mockLibraryFiles.id,
                priority: PreviewPriority.MEDIUM,
                versions: systemPreviewsSettings,
                deps: {amqpService: mockAmqpService, config: mockConfig, logger}
            });

            expect(requestPreviewGeneration).toHaveBeenNthCalledWith(2, {
                recordId: 'file2',
                pathAfter: 'file_path_2/file_name_2',
                libraryId: mockLibraryFiles.id,
                priority: PreviewPriority.MEDIUM,
                versions: systemPreviewsSettings,
                deps: {amqpService: mockAmqpService, config: mockConfig, logger}
            });
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
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': logger as winston.Winston,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.helpers.updateRecordLastModif': mockUpdateLastRecordModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdate,
                'core.infra.amqpService': mockAmqpService as IAmqpService,
                'core.infra.record': mockRecordRepo as IRecordRepo
            });

            await files.forcePreviewsGeneration({ctx, libraryId: 'libraryId', failedOnly: true});

            expect(requestPreviewGeneration).toBeCalledTimes(1);

            expect(requestPreviewGeneration).toHaveBeenCalledWith({
                recordId: 'file2',
                pathAfter: 'file_path_2/file_name_2',
                libraryId: mockLibraryFiles.id,
                priority: PreviewPriority.MEDIUM,
                versions: systemPreviewsSettings,
                deps: {amqpService: mockAmqpService, config: mockConfig, logger}
            });
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
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': logger as winston.Winston,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.helpers.updateRecordLastModif': mockUpdateLastRecordModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdate,
                'core.infra.amqpService': mockAmqpService as IAmqpService,
                'core.infra.record': mockRecordRepo as IRecordRepo
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

            expect(requestPreviewGeneration).toBeCalledTimes(1);
            expect(requestPreviewGeneration).toHaveBeenCalledWith({
                recordId: 'file1',
                pathAfter: 'file_path_1/file_name_1',
                priority: PreviewPriority.MEDIUM,
                libraryId: mockLibraryFiles.id,
                versions: systemPreviewsSettings,
                deps: {amqpService: mockAmqpService, config: mockConfig, logger}
            });
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

    describe('Create directory', () => {
        test('Create directory', async () => {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    totalCount: 0,
                    list: []
                }),
                createRecord: global.__mockPromise({record: mockRecord}),
                updateRecord: global.__mockPromise(mockRecord)
            };

            const mockTreeDomainSpecific: Mockify<ITreeDomain> = {
                getLibraryTreeId: global.__mockPromise(mockTree.id),
                getRecordByNodeId: global.__mockPromise(mockFileRecord)
            };

            const mockLibraryDirectoriesDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: global.__mockPromise(mockLibraryDirectories)
            };

            const mockCreateDirectory: Mockify<StoreUploadFileFunc> = global.__mockPromise();

            const mockUtils: Mockify<IUtils> = {
                getFilesLibraryId: jest.fn(() => mockLibraryFiles.id)
            };

            const files = filesManager({
                config: mockConfig as Config.IConfig,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.tree': mockTreeDomainSpecific as ITreeDomain,
                'core.domain.library': mockLibraryDirectoriesDomain as ILibraryDomain,
                'core.domain.helpers.createDirectory': mockCreateDirectory as CreateDirectoryFunc,
                'core.utils': mockUtils as IUtils
            });

            await files.createDirectory({library: mockLibraryDirectories.id, nodeId: 'fakeNodeId', name: 'name'}, ctx);

            expect(mockTreeDomainSpecific.getLibraryTreeId).toBeCalledTimes(1);
            expect(mockTreeDomainSpecific.getRecordByNodeId).toBeCalledTimes(1);
            expect(mockLibraryDirectoriesDomain.getLibraryProperties).toBeCalledTimes(1);
            expect(mockRecordDomain.find).toBeCalledTimes(1);
            expect(mockRecordDomain.createRecord).toBeCalledTimes(1);
            expect(mockRecordDomain.updateRecord).toBeCalledTimes(1);
            expect(mockCreateDirectory).toBeCalledTimes(1);
        });

        test('Should throw because only folders can be selected', async () => {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    totalCount: 0,
                    list: []
                }),
                createRecord: global.__mockPromise({record: mockRecord}),
                updateRecord: global.__mockPromise(mockRecord)
            };

            const mockTreeDomainSpecific: Mockify<ITreeDomain> = {
                getLibraryTreeId: global.__mockPromise(mockTree.id),
                getRecordByNodeId: global.__mockPromise(mockFileRecord)
            };

            const mockLibraryDirectoriesDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: global.__mockPromise(mockLibrary)
            };

            const mockCreateDirectory: Mockify<StoreUploadFileFunc> = global.__mockPromise();

            const mockUtils: Mockify<IUtils> = {
                generateExplicitValidationError: jest.fn(() => {
                    throw new ValidationError({});
                }),
                getFilesLibraryId: jest.fn(() => mockLibraryFiles.id)
            };

            const files = filesManager({
                config: mockConfig as Config.IConfig,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.tree': mockTreeDomainSpecific as ITreeDomain,
                'core.domain.library': mockLibraryDirectoriesDomain as ILibraryDomain,
                'core.domain.helpers.createDirectory': mockCreateDirectory as CreateDirectoryFunc,
                'core.utils': mockUtils as IUtils
            });

            await expect(
                files.createDirectory({library: mockLibraryDirectories.id, nodeId: 'fakeNodeId', name: 'name'}, ctx)
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('storeFiles', () => {
        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: global.__mockPromise({
                totalCount: 0,
                list: []
            }),
            createRecord: global.__mockPromise({record: mockRecord}),
            updateRecord: global.__mockPromise(mockRecord)
        };

        const mockRecordDomainExists: Mockify<IRecordDomain> = {
            find: global.__mockPromise({
                totalCount: 1,
                list: [{...mockRecord, id: '987654321'}]
            }),
            createRecord: global.__mockPromise({record: mockRecord}),
            updateRecord: global.__mockPromise(mockRecord)
        };

        const mockTreeDomainSpecific: Mockify<ITreeDomain> = {
            getLibraryTreeId: global.__mockPromise(mockTree.id),
            getRecordByNodeId: global.__mockPromise(mockFileRecord)
        };

        const mockLibraryDomainDirectory: Mockify<ILibraryDomain> = {
            getLibraryProperties: global.__mockPromise(mockLibraryDirectories)
        };

        const mockCreateDirectory: Mockify<StoreUploadFileFunc> = global.__mockPromise();

        const mockUtils: Mockify<IUtils> = {
            generateExplicitValidationError: jest.fn(() => {
                throw new ValidationError({});
            }),
            getFilesLibraryId: jest.fn(() => mockLibraryFiles.id)
        };

        const filesToUpload: IStoreFilesParams = {
            library: 'files',
            nodeId: '123456789',
            files: [
                {
                    data: {
                        filename: 'my_file.jpg',
                        mimetype: 'image/jpeg',
                        encoding: '7bit',
                        createReadStream: jest.fn()
                    },
                    uid: '123456789',
                    size: 42,
                    replace: false
                }
            ]
        };

        const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
            getLibraryPermission: global.__mockPromise(true)
        };

        const mockStoreUploadFile = jest.fn();

        test('Write file to disk', async () => {
            const filesManagerDomain = filesManager({
                config: mockConfig as Config.IConfig,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.tree': mockTreeDomainSpecific as ITreeDomain,
                'core.domain.library': mockLibraryDomainDirectory as ILibraryDomain,
                'core.domain.helpers.createDirectory': mockCreateDirectory as CreateDirectoryFunc,
                'core.domain.helpers.storeUploadFile': mockStoreUploadFile as StoreUploadFileFunc,
                'core.utils': mockUtils as IUtils
            });

            const storedFiles = await filesManagerDomain.storeFiles(filesToUpload, ctx);

            expect(storedFiles).toEqual([
                {
                    uid: '123456789',
                    record: {...mockRecord}
                }
            ]);

            expect(mockStoreUploadFile).toBeCalled();
            expect(mockStoreUploadFile.mock.calls[0][1]).toBe('/files/path/name'); // path
        });

        test('Handle replacement if file already exists', async () => {
            const filesManagerDomain = filesManager({
                config: mockConfig as Config.IConfig,
                'core.domain.record': mockRecordDomainExists as IRecordDomain,
                'core.domain.tree': mockTreeDomainSpecific as ITreeDomain,
                'core.domain.library': mockLibraryDomainDirectory as ILibraryDomain,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                'core.domain.helpers.createDirectory': mockCreateDirectory as CreateDirectoryFunc,
                'core.domain.helpers.storeUploadFile': mockStoreUploadFile as StoreUploadFileFunc,
                'core.utils': mockUtils as IUtils
            });

            const storedFiles = await filesManagerDomain.storeFiles(
                {...filesToUpload, files: [{...filesToUpload.files[0], replace: true}]},
                ctx
            );

            expect(storedFiles).toEqual([
                {
                    uid: '123456789',
                    record: {...mockRecord, id: '987654321'}
                }
            ]);

            expect(mockStoreUploadFile).toBeCalled();
            expect(mockStoreUploadFile.mock.calls[0][1]).toBe('/files/path/name'); // path

            expect(mockRecordDomainExists.createRecord).not.toBeCalled();
            expect(mockRecordDomainExists.updateRecord).not.toBeCalled();
        });

        test('Handle rename if file already exists', async () => {
            const filesManagerDomain = filesManager({
                config: mockConfig as Config.IConfig,
                'core.domain.record': mockRecordDomainExists as IRecordDomain,
                'core.domain.tree': mockTreeDomainSpecific as ITreeDomain,
                'core.domain.library': mockLibraryDomainDirectory as ILibraryDomain,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                'core.domain.helpers.createDirectory': mockCreateDirectory as CreateDirectoryFunc,
                'core.domain.helpers.storeUploadFile': mockStoreUploadFile as StoreUploadFileFunc,
                'core.utils': mockUtils as IUtils
            });

            const storedFiles = await filesManagerDomain.storeFiles(
                {...filesToUpload, files: [{...filesToUpload.files[0], replace: false}]},
                ctx
            );

            expect(storedFiles).toEqual([
                {
                    uid: '123456789',
                    record: {...mockRecord}
                }
            ]);

            expect(mockStoreUploadFile).toBeCalled();
            expect(mockStoreUploadFile.mock.calls[0][1]).toBe('/files/path/name'); // path

            expect(mockRecordDomainExists.createRecord).toBeCalled();
            expect(mockRecordDomainExists.updateRecord).toBeCalled();
        });

        test('Throw if destination path is not a folder', async () => {
            const filesManagerDomain = filesManager({
                config: mockConfig as Config.IConfig,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.tree': mockTreeDomainSpecific as ITreeDomain,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.helpers.createDirectory': mockCreateDirectory as CreateDirectoryFunc,
                'core.domain.helpers.storeUploadFile': mockStoreUploadFile as StoreUploadFileFunc,
                'core.utils': mockUtils as IUtils
            });

            expect(async () => filesManagerDomain.storeFiles(filesToUpload, ctx)).rejects.toThrow(ValidationError);
        });

        test('Throw if duplicate names in files to store', async () => {
            const filesManagerDomain = filesManager({
                config: mockConfig as Config.IConfig,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.tree': mockTreeDomainSpecific as ITreeDomain,
                'core.domain.library': mockLibraryDomainDirectory as ILibraryDomain,
                'core.domain.helpers.createDirectory': mockCreateDirectory as CreateDirectoryFunc,
                'core.domain.helpers.storeUploadFile': mockStoreUploadFile as StoreUploadFileFunc,
                'core.utils': mockUtils as IUtils
            });

            expect(async () =>
                filesManagerDomain.storeFiles(
                    {...filesToUpload, files: [filesToUpload.files[0], filesToUpload.files[0]]},
                    ctx
                )
            ).rejects.toThrow(ValidationError);
        });

        test('Throw if forbidden files', async () => {
            const mockConfigForbiddenFiles = {
                ...mockConfig,
                filesManager: {
                    ...mockConfig.filesManager,
                    allowFilesList: '',
                    ignoreFilesList: '**/*.jpg'
                }
            };

            const filesManagerDomain = filesManager({
                config: mockConfigForbiddenFiles as Config.IConfig,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.tree': mockTreeDomainSpecific as ITreeDomain,
                'core.domain.library': mockLibraryDomainDirectory as ILibraryDomain,
                'core.domain.helpers.createDirectory': mockCreateDirectory as CreateDirectoryFunc,
                'core.domain.helpers.storeUploadFile': mockStoreUploadFile as StoreUploadFileFunc,
                'core.utils': mockUtils as IUtils
            });

            expect(async () => filesManagerDomain.storeFiles(filesToUpload, ctx)).rejects.toThrow(ValidationError);
        });
    });
});
