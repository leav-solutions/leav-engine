// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IFilesManagerRepo} from 'infra/filesManager/filesManagerRepo';
import {IRecordRepo} from 'infra/record/recordRepo';
import {IUtils, ToAny} from 'utils/utils';
import {Winston} from 'winston';
import {IConfig} from '_types/config';
import {FileEvents} from '../../../../_types/filesManager';
import {mockFileMetadata} from '../../../../__tests__/mocks/file';
import {mockLibraryFiles} from '../../../../__tests__/mocks/library';
import {mockFileRecord} from '../../../../__tests__/mocks/record';
import {mockCtx} from '../../../../__tests__/mocks/shared';
import * as extractFileMetadata from '../extractFileMetadata';
import * as fileUtilsHelpers from '../handleFileUtilsHelper';
import * as handlePreview from '../handlePreview';
import handleFileSystemEvent, {IFileSystemEventDeps} from './handleFileSystemEvent';

jest.mock('../getRootPathByKey', () => ({getRootPathByKey: jest.fn().mockReturnValue('/path/to/root')}));

describe('handleFileSystemEvent', () => {
    const mockUtils: Mockify<IUtils> = {
        getLibraryTreeId: jest.fn().mockReturnValue('libraryTreeId'),
        getDirectoriesLibraryId: jest.fn().mockReturnValue('directoryLibraryId'),
        getPreviewsStatusAttributeName: jest.fn().mockReturnValue('previewsStatus'),
        getPreviewsAttributeName: jest.fn().mockReturnValue('previews'),
        previewsSettingsToVersions: jest.fn().mockReturnValue({})
    };

    const mockLibraryDomain: Mockify<ILibraryDomain> = {
        getLibraryProperties: global.__mockPromise(mockLibraryFiles)
    };

    const mockRecordDomain: Mockify<IRecordDomain> = {
        activateRecord: jest.fn(),
        deactivateRecord: jest.fn()
    };

    const mockTreeDomain: Mockify<ITreeDomain> = {
        moveElement: jest.fn(),
        getNodesByRecord: global.__mockPromise(['123465798'])
    };

    const mockFilesManagerRepo: Mockify<IFilesManagerRepo> = {
        getRecord: global.__mockPromise(mockFileRecord),
        getParentRecord: global.__mockPromise(mockFileRecord)
    };

    const mockFilesManagerRepoNoRecord: Mockify<IFilesManagerRepo> = {
        getRecord: global.__mockPromise(null),
        getParentRecord: global.__mockPromise(mockFileRecord)
    };

    const mockLogger: Mockify<Winston> = {
        warn: jest.fn(),
        error: jest.fn()
    };

    const mockRecordRepo: Mockify<IRecordRepo> = {
        updateRecord: jest.fn(),
        createRecord: jest.fn()
    };

    const mockConfig: Partial<IConfig> = {
        filesManager: {
            userId: 'userId',
            queues: {
                events: '',
                previewRequest: '',
                previewResponse: ''
            },
            allowFilesList: '',
            ignoreFilesList: '',
            rootKeys: {
                files1: ''
            },
            routingKeys: {
                events: '',
                previewRequest: '',
                previewResponse: ''
            },
            userGroupsIds: ''
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const depsBase: ToAny<IFileSystemEventDeps> = {
        'core.domain.library': jest.fn(),
        'core.domain.record': jest.fn(),
        'core.domain.value': jest.fn(),
        'core.domain.tree': jest.fn(),
        'core.domain.helpers.updateRecordLastModif': jest.fn(),
        'core.domain.record.helpers.sendRecordUpdateEvent': jest.fn(),
        'core.infra.record': jest.fn(),
        'core.infra.amqpService': jest.fn(),
        'core.infra.filesManager': jest.fn(),
        'core.utils.logger': jest.fn(),
        'core.utils': jest.fn(),
        config: {}
    };

    describe('Update', () => {
        const mockExtractFileMetadata = jest.fn().mockResolvedValue(mockFileMetadata);
        jest.spyOn(extractFileMetadata, 'extractFileMetadata').mockImplementation(mockExtractFileMetadata);

        test('Update file record', async () => {
            const mockRequestPreviewGeneration = jest.fn();
            jest.spyOn(handlePreview, 'requestPreviewGeneration').mockImplementation(mockRequestPreviewGeneration);

            const mockUpdatedLastRecordModif = jest.fn();
            const mockSendRecordUpdate = jest.fn();

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.helpers.updateRecordLastModif': mockUpdatedLastRecordModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdate,
                'core.infra.filesManager': mockFilesManagerRepo as IFilesManagerRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as Winston
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
                    hash: '98765431298765431'
                },
                {
                    library: 'libraryId'
                },
                mockCtx
            );

            expect(mockLogger.warn).not.toBeCalled();
            expect(mockRequestPreviewGeneration).toBeCalled();
            expect(mockExtractFileMetadata).toBeCalled();
            expect(mockRecordRepo.updateRecord).toBeCalled();
            expect(mockRecordRepo.updateRecord?.mock.calls[0][0].recordData).toMatchObject({
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
                width: 1337
            });
        });

        test('Should throw if record not found', async () => {
            const mockRequestPreviewGeneration = jest.fn();
            jest.spyOn(handlePreview, 'requestPreviewGeneration').mockImplementation(mockRequestPreviewGeneration);

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.infra.filesManager': mockFilesManagerRepoNoRecord as IFilesManagerRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as Winston
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
                    hash: '98765431298765431'
                },
                {
                    library: 'libraryId'
                },
                mockCtx
            );

            expect(mockLogger.warn).toBeCalled();
            expect(mockLogger.warn?.mock.calls[0][0]).toMatch(/record not found/);
            expect(mockRecordRepo.updateRecord).not.toBeCalled();
        });
    });

    describe('Create', () => {
        test('If file doest not exist in DB, create file record', async () => {
            const mockExtractFileMetadata = jest.fn().mockResolvedValue(mockFileMetadata);
            jest.spyOn(extractFileMetadata, 'extractFileMetadata').mockImplementation(mockExtractFileMetadata);

            const mockRequestPreviewGeneration = jest.fn();
            jest.spyOn(handlePreview, 'requestPreviewGeneration').mockImplementation(mockRequestPreviewGeneration);

            const mockCreateFileTreeElement = jest.fn();
            const mockCreateRecordFile = jest.fn().mockResolvedValue(mockFileRecord);
            jest.spyOn(fileUtilsHelpers, 'createFilesTreeElement').mockImplementation(mockCreateFileTreeElement);
            jest.spyOn(fileUtilsHelpers, 'createRecordFile').mockImplementation(mockCreateRecordFile);
            jest.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(null));
            jest.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(null));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as Winston
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
                    hash: '98765431298765431'
                },
                {
                    library: 'libraryId'
                },
                mockCtx
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
                width: 1337
            });
            expect(mockRequestPreviewGeneration).toBeCalled();
            expect(mockCreateFileTreeElement).toBeCalledTimes(1);
        });

        test('If file already exist in DB, just activate the record', async () => {
            const mockExtractFileMetadata = jest.fn().mockResolvedValue(mockFileMetadata);
            jest.spyOn(extractFileMetadata, 'extractFileMetadata').mockImplementation(mockExtractFileMetadata);

            const mockRequestPreviewGeneration = jest.fn();
            jest.spyOn(handlePreview, 'requestPreviewGeneration').mockImplementation(mockRequestPreviewGeneration);

            const mockCreateFileTreeElement = jest.fn();
            const mockCreateRecordFile = jest.fn();
            const mockUpdateRecordFile = jest.fn().mockResolvedValue(mockFileRecord);
            jest.spyOn(fileUtilsHelpers, 'createFilesTreeElement').mockImplementation(mockCreateFileTreeElement);
            jest.spyOn(fileUtilsHelpers, 'createRecordFile').mockImplementation(mockCreateRecordFile);
            jest.spyOn(fileUtilsHelpers, 'updateRecordFile').mockImplementation(mockUpdateRecordFile);
            jest.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() =>
                Promise.resolve({...mockFileRecord, active: false})
            );
            jest.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(null));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as Winston,
                config: mockConfig as IConfig
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
                    hash: '98765431298765431'
                },
                {
                    library: 'libraryId'
                },
                mockCtx
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
                width: 1337
            });
            expect(mockRequestPreviewGeneration).toBeCalled();
            expect(mockCreateFileTreeElement).toBeCalledTimes(1);
        });

        test('If creating a directory, does not call previews generation', async () => {
            const mockExtractFileMetadata = jest.fn().mockResolvedValue(mockFileMetadata);
            jest.spyOn(extractFileMetadata, 'extractFileMetadata').mockImplementation(mockExtractFileMetadata);

            const mockRequestPreviewGeneration = jest.fn();
            jest.spyOn(handlePreview, 'requestPreviewGeneration').mockImplementation(mockRequestPreviewGeneration);

            const mockCreateFileTreeElement = jest.fn();
            const mockCreateRecordFile = jest.fn();
            const mockUpdateRecordFile = jest.fn().mockResolvedValue(mockFileRecord);
            jest.spyOn(fileUtilsHelpers, 'createFilesTreeElement').mockImplementation(mockCreateFileTreeElement);
            jest.spyOn(fileUtilsHelpers, 'createRecordFile').mockImplementation(mockCreateRecordFile);
            jest.spyOn(fileUtilsHelpers, 'updateRecordFile').mockImplementation(mockUpdateRecordFile);
            jest.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(null));
            jest.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(null));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as Winston,
                config: mockConfig as IConfig
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
                    hash: '98765431298765431'
                },
                {
                    library: 'libraryId'
                },
                mockCtx
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
            const mockDeleteFileTreeElement = jest.fn();
            jest.spyOn(fileUtilsHelpers, 'deleteFilesTreeElement').mockImplementation(mockDeleteFileTreeElement);
            jest.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(mockFileRecord));
            jest.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(null));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as Winston,
                config: mockConfig as IConfig
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
                    hash: '98765431298765431'
                },
                {
                    library: 'libraryId'
                },
                mockCtx
            );

            expect(mockLogger.warn).not.toBeCalled();
            expect(mockLogger.error).not.toBeCalled();
            expect(mockDeleteFileTreeElement).toBeCalled();
            expect(mockRecordDomain.deactivateRecord).toBeCalled();
        });

        test('Should throw if record not found', async () => {
            const mockDeleteFileTreeElement = jest.fn();
            jest.spyOn(fileUtilsHelpers, 'deleteFilesTreeElement').mockImplementation(mockDeleteFileTreeElement);
            jest.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(null));
            jest.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(null));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as Winston,
                config: mockConfig as IConfig
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
                    hash: '98765431298765431'
                },
                {
                    library: 'libraryId'
                },
                mockCtx
            );

            expect(mockLogger.warn).not.toBeCalled();
            expect(mockLogger.error).toBeCalled();
            expect(mockDeleteFileTreeElement).not.toBeCalled();
            expect(mockRecordDomain.deactivateRecord).not.toBeCalled();
        });
    });

    describe('Move', () => {
        test('Move the record in the tree and update path on the record', async () => {
            const mockUpdateRecordFile = jest.fn().mockResolvedValue(mockFileRecord);
            jest.spyOn(fileUtilsHelpers, 'updateRecordFile').mockImplementation(mockUpdateRecordFile);
            jest.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(mockFileRecord));
            jest.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(mockFileRecord));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.tree': mockTreeDomain as ITreeDomain,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as Winston,
                config: mockConfig as IConfig
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
                    hash: '98765431298765431'
                },
                {
                    library: 'libraryId'
                },
                mockCtx
            );

            expect(mockLogger.warn).not.toBeCalled();
            expect(mockLogger.error).not.toBeCalled();
            expect(mockTreeDomain.moveElement).toBeCalled();
            expect(mockUpdateRecordFile).toBeCalled();
            expect(mockUpdateRecordFile.mock.calls[0][0]).toMatchObject({
                file_path: '/new/path/to/file',
                root_key: 'root_key',
                file_name: '1.jpg'
            });
        });

        test('Should throw if record not found', async () => {
            const mockUpdateRecordFile = jest.fn().mockResolvedValue(mockFileRecord);
            jest.spyOn(fileUtilsHelpers, 'updateRecordFile').mockImplementation(mockUpdateRecordFile);
            jest.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(null));
            jest.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(mockFileRecord));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.tree': mockTreeDomain as ITreeDomain,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as Winston,
                config: mockConfig as IConfig
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
                    hash: '98765431298765431'
                },
                {
                    library: 'libraryId'
                },
                mockCtx
            );

            expect(mockLogger.error).toBeCalled();
            expect(mockTreeDomain.moveElement).not.toBeCalled();
            expect(mockUpdateRecordFile).not.toBeCalled();
        });

        test('Should throw if destination record not found', async () => {
            const mockUpdateRecordFile = jest.fn().mockResolvedValue(mockFileRecord);
            jest.spyOn(fileUtilsHelpers, 'updateRecordFile').mockImplementation(mockUpdateRecordFile);
            jest.spyOn(fileUtilsHelpers, 'getRecord').mockImplementation(() => Promise.resolve(mockFileRecord));
            jest.spyOn(fileUtilsHelpers, 'getParentRecord').mockImplementation(() => Promise.resolve(null));

            const func = handleFileSystemEvent({
                ...depsBase,
                'core.domain.library': mockLibraryDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.tree': mockTreeDomain as ITreeDomain,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.utils': mockUtils as IUtils,
                'core.utils.logger': mockLogger as Winston,
                config: mockConfig as IConfig
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
                    hash: '98765431298765431'
                },
                {
                    library: 'libraryId'
                },
                mockCtx
            );

            expect(mockLogger.error).toBeCalled();
            expect(mockTreeDomain.moveElement).not.toBeCalled();
            expect(mockUpdateRecordFile).toBeCalled();
        });
    });
});
