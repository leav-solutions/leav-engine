// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILibraryDomain} from '../../../library/libraryDomain';
import {type IRecordDomain} from '../../../record/recordDomain';
import {type ITreeDomain} from '../../../tree/treeDomain';
import {type IFilesManagerRepo} from '../../../../infra/filesManager/filesManagerRepo';
import {type IRecordRepo} from '../../../../infra/record/recordRepo';
import {type IUtils, type ToAny} from '../../../../utils/utils';
import {type ILogger} from '@leav/logger';
import {type IConfig} from '../../../../_types/config';
import {FileEvents} from '../../../../_types/filesManager';
import {mockFileMetadata} from '../../../../__tests__/mocks/file';
import {mockLibraryFiles} from '../../../../__tests__/mocks/library';
import {mockFileRecord} from '../../../../__tests__/mocks/record';
import {mockCtx} from '../../../../__tests__/mocks/shared';
import * as extractFileMetadata from '../extractFileMetadata';
import * as fileUtilsHelpers from '../handleFileUtilsHelper';
import * as handlePreview from '../handlePreview';
import handleFileSystemEvent, {type IFileSystemEventDeps} from './handleFileSystemEvent';

vi.mock('../getRootPathByKey', () => ({getRootPathByKey: vi.fn().mockReturnValue('/path/to/root')}));

describe('handleFileSystemEvent', () => {
    const mockUtils: Mockify<IUtils> = {
        getLibraryTreeId: vi.fn().mockReturnValue('libraryTreeId'),
        getDirectoriesLibraryId: vi.fn().mockReturnValue('directoryLibraryId'),
        getPreviewsStatusAttributeName: vi.fn().mockReturnValue('previewsStatus'),
        getPreviewsAttributeName: vi.fn().mockReturnValue('previews'),
        previewsSettingsToVersions: vi.fn().mockReturnValue({}),
    };

    const mockLibraryDomain: Mockify<ILibraryDomain> = {
        getLibraryProperties: global.__mockPromise(mockLibraryFiles),
    };

    const mockRecordDomain: Mockify<IRecordDomain> = {
        activateRecord: vi.fn(),
        deactivateRecord: vi.fn(),
    };

    const mockTreeDomain: Mockify<ITreeDomain> = {
        moveElement: vi.fn(),
        getNodesByRecord: global.__mockPromise(['123465798']),
    };

    const mockFilesManagerRepo: Mockify<IFilesManagerRepo> = {
        getRecord: global.__mockPromise(mockFileRecord),
        getParentRecord: global.__mockPromise(mockFileRecord),
    };

    const mockFilesManagerRepoNoRecord: Mockify<IFilesManagerRepo> = {
        getRecord: global.__mockPromise(null),
        getParentRecord: global.__mockPromise(mockFileRecord),
    };

    const mockLogger = {
        warn: vi.fn(),
        error: vi.fn(),
    } satisfies Mockify<ILogger>;

    const mockRecordRepo = {
        updateRecord: vi.fn(),
        createRecord: vi.fn(),
    } satisfies Mockify<IRecordRepo>;

    const mockConfig: Partial<IConfig> = {
        filesManager: {
            queues: {
                events: '',
                previewRequest: '',
                previewResponse: '',
            },
            allowFilesList: '',
            ignoreFilesList: '',
            rootKeys: {
                files1: '',
            },
            routingKeys: {
                events: '',
                previewRequest: '',
                previewResponse: '',
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const depsBase: ToAny<IFileSystemEventDeps> = {
        'core.domain.library': vi.fn(),
        'core.domain.record': vi.fn(),
        'core.domain.value': vi.fn(),
        'core.domain.tree': vi.fn(),
        'core.domain.helpers.updateRecordLastModif': vi.fn(),
        'core.domain.record.helpers.sendRecordUpdateEvent': vi.fn(),
        'core.infra.record': vi.fn(),
        'core.infra.amqpService': vi.fn(),
        'core.infra.filesManager': vi.fn(),
        'core.utils.logger': vi.fn(),
        'core.utils': vi.fn(),
        config: {},
    };

    describe('Update', () => {
        const mockExtractFileMetadata = vi.fn().mockResolvedValue(mockFileMetadata);
        vi.spyOn(extractFileMetadata, 'extractFileMetadata').mockImplementation(mockExtractFileMetadata);

        test('Update file record', async () => {
            const mockRequestPreviewGeneration = vi.fn();
            vi.spyOn(handlePreview, 'requestPreviewGeneration').mockImplementation(mockRequestPreviewGeneration);

            const mockUpdatedLastRecordModif = vi.fn();
            const mockSendRecordUpdate = vi.fn();

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.helpers.updateRecordLastModif': mockUpdatedLastRecordModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdate,
                'core.infra.filesManager': mockFilesManagerRepo as IFilesManagerRepo,
                'core.infra.record': mockRecordRepo as any,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as any,
            });

            await func(
                {
                    event: FileEvents.UPDATE,
                    inode: 123456,
                    isDirectory: false,
                    pathAfter: '/path/to/file/1.jpg',
                    pathBefore: '/path/to/file/1.jpg',
                    rootKey: 'root_key',
                    time: 123456789,
                    hash: '98765431298765431',
                },
                {
                    library: 'libraryId',
                },
                mockCtx,
            );

            expect(mockLogger.warn).not.toBeCalled();
            expect(mockRequestPreviewGeneration).toBeCalled();
            expect(mockExtractFileMetadata).toBeCalled();
            expect(mockRecordRepo.updateRecord).toBeCalled();
            expect(mockRecordRepo.updateRecord.mock.calls[0][0].recordData).toMatchObject({
                color_profile: 'Some Profile',
                color_space: 'sRGB',
                file_size: 421377,
                has_clipping_path: true,
                hash: '98765431298765431',
                height: 1337,
                id: '123456',
                inode: 123456,
                mime_type1: 'image',
                mime_type2: 'jpeg',
                print_height: 471.66388888888883,
                print_width: 471.66388888888883,
                resolution: 72,
                root_key: 'root_key',
                width: 1337,
            });
        });

        test('Should throw if record not found', async () => {
            const mockRequestPreviewGeneration = vi.fn();
            vi.spyOn(handlePreview, 'requestPreviewGeneration').mockImplementation(mockRequestPreviewGeneration);

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.infra.filesManager': mockFilesManagerRepoNoRecord as IFilesManagerRepo,
                'core.infra.record': mockRecordRepo as any,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as any,
            });

            await func(
                {
                    event: FileEvents.UPDATE,
                    inode: 123456,
                    isDirectory: false,
                    pathAfter: '/path/to/file/1.jpg',
                    pathBefore: '/path/to/file/1.jpg',
                    rootKey: 'root_key',
                    time: 123456789,
                    hash: '98765431298765431',
                },
                {
                    library: 'libraryId',
                },
                mockCtx,
            );

            expect(mockLogger.warn).toBeCalled();
            expect(mockLogger.warn.mock.calls[0][0]).toMatch(/record not found/);
            expect(mockRecordRepo.updateRecord).not.toBeCalled();
        });
    });

    describe('Create', () => {
        test('If file doest not exist in DB, create file record', async () => {
            const mockExtractFileMetadata = vi.fn().mockResolvedValue(mockFileMetadata);
            vi.spyOn(extractFileMetadata, 'extractFileMetadata').mockImplementation(mockExtractFileMetadata);

            const mockRequestPreviewGeneration = vi.fn();
            vi.spyOn(handlePreview, 'requestPreviewGeneration').mockImplementation(mockRequestPreviewGeneration);

            const mockCreateFileTreeElement = vi.fn();
            const mockCreateRecordFile = vi.fn().mockResolvedValue(mockFileRecord);
            vi.spyOn(fileUtilsHelpers, 'createFilesTreeElement').mockImplementation(mockCreateFileTreeElement);
            vi.spyOn(fileUtilsHelpers, 'createRecordFile').mockImplementation(mockCreateRecordFile);
            vi.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(null));
            vi.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(null));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.infra.record': mockRecordRepo as any,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as any,
            });

            await func(
                {
                    event: FileEvents.CREATE,
                    inode: 123456,
                    isDirectory: false,
                    pathAfter: '/path/to/file/1.jpg',
                    pathBefore: '/path/to/file/1.jpg',
                    rootKey: 'root_key',
                    time: 123456789,
                    hash: '98765431298765431',
                },
                {
                    library: 'libraryId',
                },
                mockCtx,
            );

            expect(mockLogger.warn).not.toBeCalled();
            expect(mockCreateRecordFile).toBeCalled();
            expect(mockCreateRecordFile.mock.calls[0][0]).toMatchObject({
                color_profile: 'Some Profile',
                color_space: 'sRGB',
                file_size: 421377,
                has_clipping_path: true,
                hash: '98765431298765431',
                height: 1337,
                inode: 123456,
                mime_type1: 'image',
                mime_type2: 'jpeg',
                print_height: 471.66388888888883,
                print_width: 471.66388888888883,
                resolution: 72,
                root_key: 'root_key',
                width: 1337,
            });
            expect(mockRequestPreviewGeneration).toBeCalled();
            expect(mockCreateFileTreeElement).toBeCalledTimes(1);
        });

        test('If file already exist in DB, just activate the record', async () => {
            const mockExtractFileMetadata = vi.fn().mockResolvedValue(mockFileMetadata);
            vi.spyOn(extractFileMetadata, 'extractFileMetadata').mockImplementation(mockExtractFileMetadata);

            const mockRequestPreviewGeneration = vi.fn();
            vi.spyOn(handlePreview, 'requestPreviewGeneration').mockImplementation(mockRequestPreviewGeneration);

            const mockCreateFileTreeElement = vi.fn();
            const mockCreateRecordFile = vi.fn();
            const mockUpdateRecordFile = vi.fn().mockResolvedValue(mockFileRecord);
            vi.spyOn(fileUtilsHelpers, 'createFilesTreeElement').mockImplementation(mockCreateFileTreeElement);
            vi.spyOn(fileUtilsHelpers, 'createRecordFile').mockImplementation(mockCreateRecordFile);
            vi.spyOn(fileUtilsHelpers, 'updateRecordFile').mockImplementation(mockUpdateRecordFile);
            vi.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() =>
                Promise.resolve({...mockFileRecord, active: false}),
            );
            vi.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(null));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.infra.record': mockRecordRepo as any,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as any,
                config: mockConfig as IConfig,
            });

            await func(
                {
                    event: FileEvents.CREATE,
                    inode: 123456,
                    isDirectory: false,
                    pathAfter: '/path/to/file/1.jpg',
                    pathBefore: '/path/to/file/1.jpg',
                    rootKey: 'root_key',
                    time: 123456789,
                    hash: '98765431298765431',
                },
                {
                    library: 'libraryId',
                },
                mockCtx,
            );

            expect(mockLogger.warn).not.toBeCalled();
            expect(mockLogger.error).not.toBeCalled();
            expect(mockCreateRecordFile).not.toBeCalled();
            expect(mockRecordDomain.activateRecord).toBeCalled();
            expect(mockUpdateRecordFile).toBeCalled();
            expect(mockUpdateRecordFile.mock.calls[0][0]).toMatchObject({
                color_profile: 'Some Profile',
                color_space: 'sRGB',
                file_size: 421377,
                has_clipping_path: true,
                hash: '98765431298765431',
                height: 1337,
                inode: 123456,
                mime_type1: 'image',
                mime_type2: 'jpeg',
                print_height: 471.66388888888883,
                print_width: 471.66388888888883,
                resolution: 72,
                root_key: 'root_key',
                width: 1337,
            });
            expect(mockRequestPreviewGeneration).toBeCalled();
            expect(mockCreateFileTreeElement).toBeCalledTimes(1);
        });

        test('If creating a directory, does not call previews generation', async () => {
            const mockExtractFileMetadata = vi.fn().mockResolvedValue(mockFileMetadata);
            vi.spyOn(extractFileMetadata, 'extractFileMetadata').mockImplementation(mockExtractFileMetadata);

            const mockRequestPreviewGeneration = vi.fn();
            vi.spyOn(handlePreview, 'requestPreviewGeneration').mockImplementation(mockRequestPreviewGeneration);

            const mockCreateFileTreeElement = vi.fn();
            const mockCreateRecordFile = vi.fn();
            const mockUpdateRecordFile = vi.fn().mockResolvedValue(mockFileRecord);
            vi.spyOn(fileUtilsHelpers, 'createFilesTreeElement').mockImplementation(mockCreateFileTreeElement);
            vi.spyOn(fileUtilsHelpers, 'createRecordFile').mockImplementation(mockCreateRecordFile);
            vi.spyOn(fileUtilsHelpers, 'updateRecordFile').mockImplementation(mockUpdateRecordFile);
            vi.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(null));
            vi.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(null));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.infra.record': mockRecordRepo as any,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as any,
                config: mockConfig as IConfig,
            });

            await func(
                {
                    event: FileEvents.CREATE,
                    inode: 123456,
                    isDirectory: true,
                    pathAfter: '/path/to/file/1.jpg',
                    pathBefore: '/path/to/file/1.jpg',
                    rootKey: 'root_key',
                    time: 123456789,
                    hash: '98765431298765431',
                },
                {
                    library: 'libraryId',
                },
                mockCtx,
            );

            expect(mockLogger.warn).not.toBeCalled();
            expect(mockLogger.error).not.toBeCalled();
            expect(mockCreateRecordFile).toBeCalled();
            expect(mockRequestPreviewGeneration).not.toBeCalled();
            expect(mockCreateFileTreeElement).toBeCalled();
        });
    });

    describe('Remove', () => {
        test('Deactivate the record and remove it from the tree', async () => {
            const mockDeleteFileTreeElement = vi.fn();
            vi.spyOn(fileUtilsHelpers, 'deleteFilesTreeElement').mockImplementation(mockDeleteFileTreeElement);
            vi.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(mockFileRecord));
            vi.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(null));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.infra.record': mockRecordRepo as any,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as any,
                config: mockConfig as IConfig,
            });

            await func(
                {
                    event: FileEvents.REMOVE,
                    inode: 123456,
                    isDirectory: true,
                    pathAfter: '/path/to/file/1.jpg',
                    pathBefore: '/path/to/file/1.jpg',
                    rootKey: 'root_key',
                    time: 123456789,
                    hash: '98765431298765431',
                },
                {
                    library: 'libraryId',
                },
                mockCtx,
            );

            expect(mockLogger.warn).not.toBeCalled();
            expect(mockLogger.error).not.toBeCalled();
            expect(mockDeleteFileTreeElement).toBeCalled();
            expect(mockRecordDomain.deactivateRecord).toBeCalled();
        });

        test('Should throw if record not found', async () => {
            const mockDeleteFileTreeElement = vi.fn();
            vi.spyOn(fileUtilsHelpers, 'deleteFilesTreeElement').mockImplementation(mockDeleteFileTreeElement);
            vi.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(null));
            vi.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(null));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.infra.record': mockRecordRepo as any,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as any,
                config: mockConfig as IConfig,
            });

            await func(
                {
                    event: FileEvents.REMOVE,
                    inode: 123456,
                    isDirectory: true,
                    pathAfter: '/path/to/file/1.jpg',
                    pathBefore: '/path/to/file/1.jpg',
                    rootKey: 'root_key',
                    time: 123456789,
                    hash: '98765431298765431',
                },
                {
                    library: 'libraryId',
                },
                mockCtx,
            );

            expect(mockLogger.warn).not.toBeCalled();
            expect(mockLogger.error).toBeCalled();
            expect(mockDeleteFileTreeElement).not.toBeCalled();
            expect(mockRecordDomain.deactivateRecord).not.toBeCalled();
        });
    });

    describe('Move', () => {
        test('Move the record in the tree and update path on the record', async () => {
            const mockUpdateRecordFile = vi.fn().mockResolvedValue(mockFileRecord);
            vi.spyOn(fileUtilsHelpers, 'updateRecordFile').mockImplementation(mockUpdateRecordFile);
            vi.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(mockFileRecord));
            vi.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(mockFileRecord));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.tree': mockTreeDomain as ITreeDomain,
                'core.infra.record': mockRecordRepo as any,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as any,
                config: mockConfig as IConfig,
            });

            await func(
                {
                    event: FileEvents.MOVE,
                    inode: 123456,
                    isDirectory: true,
                    pathBefore: '/path/to/file/1.jpg',
                    pathAfter: '/new/path/to/file/1.jpg',
                    rootKey: 'root_key',
                    time: 123456789,
                    hash: '98765431298765431',
                },
                {
                    library: 'libraryId',
                },
                mockCtx,
            );

            expect(mockLogger.warn).not.toBeCalled();
            expect(mockLogger.error).not.toBeCalled();
            expect(mockTreeDomain.moveElement).toBeCalled();
            expect(mockUpdateRecordFile).toBeCalled();
            expect(mockUpdateRecordFile.mock.calls[0][0]).toMatchObject({
                file_path: '/new/path/to/file',
                root_key: 'root_key',
                file_name: '1.jpg',
            });
        });

        test('Should throw if record not found', async () => {
            const mockUpdateRecordFile = vi.fn().mockResolvedValue(mockFileRecord);
            vi.spyOn(fileUtilsHelpers, 'updateRecordFile').mockImplementation(mockUpdateRecordFile);
            vi.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(null));
            vi.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(mockFileRecord));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.tree': mockTreeDomain as ITreeDomain,
                'core.infra.record': mockRecordRepo as any,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as any,
                config: mockConfig as IConfig,
            });

            await func(
                {
                    event: FileEvents.MOVE,
                    inode: 123456,
                    isDirectory: true,
                    pathBefore: '/path/to/file/1.jpg',
                    pathAfter: '/new/path/to/file/1.jpg',
                    rootKey: 'root_key',
                    time: 123456789,
                    hash: '98765431298765431',
                },
                {
                    library: 'libraryId',
                },
                mockCtx,
            );

            expect(mockLogger.error).toBeCalled();
            expect(mockTreeDomain.moveElement).not.toBeCalled();
            expect(mockUpdateRecordFile).not.toBeCalled();
        });

        test('Should throw if destination record not found', async () => {
            const mockUpdateRecordFile = vi.fn().mockResolvedValue(mockFileRecord);
            vi.spyOn(fileUtilsHelpers, 'updateRecordFile').mockImplementation(mockUpdateRecordFile);
            vi.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(mockFileRecord));
            vi.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(null));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.tree': mockTreeDomain as ITreeDomain,
                'core.infra.record': mockRecordRepo as any,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as any,
                config: mockConfig as IConfig,
            });

            await func(
                {
                    event: FileEvents.MOVE,
                    inode: 123456,
                    isDirectory: true,
                    pathBefore: '/path/to/file/1.jpg',
                    pathAfter: '/new/path/to/file/1.jpg',
                    rootKey: 'root_key',
                    time: 123456789,
                    hash: '98765431298765431',
                },
                {
                    library: 'libraryId',
                },
                mockCtx,
            );

            expect(mockLogger.error).toBeCalled();
            expect(mockTreeDomain.moveElement).not.toBeCalled();
            expect(mockUpdateRecordFile).toBeCalled();
        });
    });
});
