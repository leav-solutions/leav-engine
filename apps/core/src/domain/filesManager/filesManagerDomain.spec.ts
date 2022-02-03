// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import amqpService, {IAmqpService} from '../../infra/amqp/amqpService';
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
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn()
};

const mockAmqpService = amqpService({
    'core.infra.amqp': {
        publisher: {connection: null, channel: mockAmqpChannel as amqp.ConfirmChannel},
        consumer: {connection: null, channel: mockAmqpChannel as amqp.ConfirmChannel}
    },
    config: mockConfig as Config.IConfig
});

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

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Init', async () => {
        const files = filesManager({
            config: mockConfig as Config.IConfig,
            'core.utils.logger': logger as winston.Winston,
            'core.infra.amqp.amqpService': mockAmqpService as IAmqpService
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
            'core.infra.amqp.amqpService': mockAmqpService as IAmqpService
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
            ])
        };

        const files = filesManager({
            config: mockConfig as Config.IConfig,
            'core.utils.logger': logger as winston.Winston,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.infra.amqp.amqpService': mockAmqpService as IAmqpService,
            'core.domain.tree': mockTreeDomain as ITreeDomain
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
            'core.infra.amqp.amqpService': mockAmqpService as IAmqpService
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
            'core.infra.amqp.amqpService': mockAmqpService as IAmqpService
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
});
