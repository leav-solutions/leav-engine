import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {join} from 'path';
import * as amqp from 'amqplib';
import * as Config from '_types/config';
import {IValueDomain} from '../../domain/value/valueDomain';
import amqpService, {IAmqpService} from '../../infra/amqp/amqpService';
import {IUtils} from '../../utils/utils';
import {FileEvents, FilesAttributes, IFileEventData} from '../../_types/filesManager';
import {IRecord, Operator} from '../../_types/record';
import filesManager from './filesManagerDomain';
import moment = require('moment');
import winston = require('winston');

describe('FilesManager', () => {
    test('Init message listening', async () => {
        const mockConfig: Mockify<Config.IConfig> = {
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

        const logger: Mockify<winston.Winston> = {
            error: jest.fn((...args) => console.log(args)),
            warn: jest.fn((...args) => console.log(args))
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

        const mockAmqpService = amqpService({
            'core.infra.amqp': {connection: null, channel: mockAmqpChannel as amqp.ConfirmChannel},
            config: mockConfig as Config.IConfig
        });

        const files = filesManager({
            config: mockConfig as Config.IConfig,
            'core.utils.logger': logger as winston.Winston,
            'core.infra.amqp.amqpService': mockAmqpService as IAmqpService
        });

        await files.init();

        expect(mockAmqpChannel.consume).toBeCalled();
    });

    describe('test fileDomain event receive from scan', () => {
        const fileName = 'test.jpg';
        const filePath = '.';

        const library = 'files';
        const libraryTreeId = 'tree_files';

        const rootKey = 'files1';

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

        let onMessage: (msg: string) => Promise<void>;

        const mockAmqpService: Mockify<IAmqpService> = {
            consume: jest.fn((...args) => (onMessage = args[2])),
            publish: jest.fn()
        };

        const logger: Mockify<winston.Winston> = {
            error: jest.fn((...args) => console.log(args)),
            warn: jest.fn((...args) => console.log(args))
        };

        const mockRecord: Mockify<IRecord> = {
            id: '1'
        };
        const mockRecordDomain: Mockify<IRecordDomain> = {
            createRecord: jest.fn(() => mockRecord),
            find: jest.fn().mockReturnValue({
                list: []
            }),
            deactivateRecord: jest.fn()
        };

        const mockValueDomain: Mockify<IValueDomain> = {
            saveValueBatch: jest.fn()
        };

        const mockTreeDomain: Mockify<ITreeDomain> = {
            addElement: jest.fn(),
            deleteElement: jest.fn(),
            moveElement: jest.fn()
        };

        const mockUtils: Mockify<IUtils> = {
            getLibraryTreeId: jest.fn().mockReturnValue(libraryTreeId)
        };

        const files = filesManager({
            config: mockConfig as Config.IConfig,
            'core.infra.amqp.amqpService': mockAmqpService as IAmqpService,
            'core.utils.logger': logger as winston.Winston,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.value': mockValueDomain as IValueDomain,
            'core.domain.tree': mockTreeDomain as ITreeDomain,
            'core.utils': mockUtils as IUtils
        });

        test('init filesDomain', async () => {
            await files.init();
            expect(onMessage).toBeInstanceOf(Function);
        });

        test('CREATE event', async () => {
            const msg: IFileEventData = {
                event: FileEvents.CREATE,
                time: moment().unix(),
                pathBefore: null,
                pathAfter: join(filePath, fileName),
                inode: Math.round(Math.random() * 100000),
                rootKey,
                isDirectory: false
            };

            // change find value return
            mockRecordDomain.find.mockReturnValue({
                list: []
            });

            await onMessage(JSON.stringify(msg));

            // expect to create the record
            expect(mockRecordDomain.createRecord).toBeCalledWith(library, {
                userId: mockConfig.filesManager.userId
            });

            // expect to save record attribute
            expect(mockValueDomain.saveValueBatch).toBeCalledWith({
                library,
                recordId: mockRecord.id,
                values: expect.anything(),
                ctx: expect.anything()
            });

            // expect to send a message to generate preview
            expect(mockAmqpService.publish).toBeCalledWith(
                mockConfig.amqp.exchange,
                mockConfig.filesManager.routingKeys.previewRequest,
                expect.anything()
            );
        });

        test('REMOVE event', async () => {
            const msg: IFileEventData = {
                event: FileEvents.REMOVE,
                time: moment().unix(),
                pathBefore: join(filePath, fileName),
                pathAfter: null,
                inode: Math.round(Math.random() * 100000),
                rootKey,
                isDirectory: false
            };

            // change find value return
            mockRecordDomain.find.mockReturnValue({
                list: [mockRecord]
            });

            await onMessage(JSON.stringify(msg));

            // expect to search for the record
            expect(mockRecordDomain.find).toBeCalledWith({
                params: {
                    library,
                    filters: [
                        {field: FilesAttributes.FILE_NAME, value: fileName},
                        {operator: 'AND'},
                        {field: FilesAttributes.FILE_PATH, value: filePath}
                    ],
                    retrieveInactive: false
                },
                ctx: expect.anything()
            });

            // expect to disable the record
            expect(mockRecordDomain.deactivateRecord).toBeCalledWith(mockRecord, {
                userId: mockConfig.filesManager.userId
            });

            // expect to delete the record from the tree
            expect(mockTreeDomain.deleteElement).toBeCalledWith({
                treeId: libraryTreeId,
                element: {
                    id: mockRecord.id,
                    library
                },
                deleteChildren: true,
                ctx: expect.anything()
            });
        });

        test('UPDATE event', async () => {
            const inode = Math.round(Math.random() * 100000);
            const msg: IFileEventData = {
                event: FileEvents.UPDATE,
                time: moment().unix(),
                pathBefore: join(filePath, fileName),
                pathAfter: join(filePath, fileName),
                inode,
                rootKey,
                isDirectory: false
            };

            // change find value return
            mockRecordDomain.find.mockReturnValue({
                list: [mockRecord]
            });

            await onMessage(JSON.stringify(msg));

            // expect to search the record
            expect(mockRecordDomain.find).toBeCalledWith({
                params: {
                    library,
                    filters: [
                        {field: FilesAttributes.FILE_NAME, value: fileName},
                        {operator: 'AND'},
                        {field: FilesAttributes.FILE_PATH, value: filePath}
                    ],
                    retrieveInactive: false
                },
                ctx: expect.anything()
            });

            // expect to update attribute
            expect(mockValueDomain.saveValueBatch).toBeCalledWith({
                library,
                recordId: mockRecord.id,
                values: expect.arrayContaining([
                    {
                        attribute: FilesAttributes.INODE,
                        value: inode
                    },
                    {
                        attribute: FilesAttributes.ROOT_KEY,
                        value: rootKey
                    }
                ]),
                ctx: expect.anything()
            });

            // expect to send a message for generate preview
            expect(mockAmqpService.publish).toBeCalledWith(
                mockConfig.amqp.exchange,
                mockConfig.filesManager.routingKeys.previewRequest,
                expect.anything()
            );
        });

        test('MOVE event', async () => {
            const destFileName = 'test.png';

            const msg: IFileEventData = {
                event: FileEvents.MOVE,
                time: moment().unix(),
                pathBefore: join(filePath, fileName),
                pathAfter: join(filePath, destFileName),
                inode: Math.round(Math.random() * 100000),
                rootKey,
                isDirectory: false
            };

            const mockDestRecord: Mockify<IRecord> = {
                id: '2'
            };

            // change find value return
            mockRecordDomain.find
                .mockReturnValueOnce({
                    list: [mockDestRecord]
                })
                .mockReturnValueOnce({
                    list: [mockRecord]
                })
                .mockReturnValueOnce({
                    list: [mockDestRecord]
                })
                .mockReturnValue({
                    list: [mockRecord]
                });

            await onMessage(JSON.stringify(msg));

            // search for the destination record
            expect(mockRecordDomain.find).toBeCalledWith({
                params: {
                    library,
                    filters: [
                        {field: FilesAttributes.FILE_NAME, value: destFileName},
                        {operator: Operator.AND},
                        {field: FilesAttributes.FILE_PATH, value: filePath}
                    ],
                    retrieveInactive: false
                },
                ctx: expect.anything()
            });

            // search for the origin record
            expect(mockRecordDomain.find).toBeCalledWith({
                params: {
                    library,
                    filters: [
                        {field: FilesAttributes.FILE_NAME, value: fileName},
                        {operator: Operator.AND},
                        {field: FilesAttributes.FILE_PATH, value: filePath}
                    ],
                    retrieveInactive: false
                },
                ctx: expect.anything()
            });

            // disable the destination record
            expect(mockRecordDomain.deactivateRecord).toBeCalledWith(mockDestRecord, {
                userId: mockConfig.filesManager.userId
            });

            // update the attributes of the origin record
            expect(mockValueDomain.saveValueBatch).toBeCalledWith({
                library,
                recordId: mockRecord.id,
                values: [
                    {
                        attribute: FilesAttributes.ROOT_KEY,
                        value: rootKey
                    },
                    {
                        attribute: FilesAttributes.FILE_PATH,
                        value: filePath
                    },
                    {
                        attribute: FilesAttributes.FILE_NAME,
                        value: destFileName
                    }
                ],
                ctx: expect.anything()
            });

            // // move the element in the tree
            expect(mockTreeDomain.moveElement).toBeCalledWith({
                treeId: libraryTreeId,
                element: {
                    id: mockRecord.id,
                    library
                },
                parentTo: {
                    id: mockDestRecord.id,
                    library
                },
                ctx: expect.anything()
            });
        });
    });
});
