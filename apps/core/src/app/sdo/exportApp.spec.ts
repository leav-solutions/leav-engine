import {type ToAny} from '../../utils/utils';
import {type IExportAppDeps, default as exportApp} from './exportApp';
import {type ConsumeMessage} from 'amqplib';
import {sdoPathIdentifierUuid, type ISDOSettings} from '../../_types/sdo';
import mockRabbitMQService, {setupMockRabbitMQService} from '../../__tests__/mocks/sdo/rabbitMQ';
import {systemUserId} from '../../_constants/users';
import {mockDataEvent, mockDataEventMessage, mockSDO} from '../../__tests__/mocks/sdo/data';
import LeavError from '../../errors/LeavError';
import {mockExportDomain, mockSdoDomain} from '../../__tests__/mocks/sdo/domains';
import {mockSystemQueryContext} from '../../__tests__/mocks/sdo/core';
import {EventAction} from '@leav/utils';

const sdoGlobalSettings = {
    timer: 120000,
    mapping: {
        myLibrary: {
            leavLibraryId: 'campaigns',
            sdoAttributes: {
                [sdoPathIdentifierUuid]: {leavAttributeId: 'uuid', valueRequired: true, format: 'string'},
                mySdoPath: {leavAttributeId: 'attribute', valueRequired: true, format: 'string'},
            },
        },
    },
} satisfies ISDOSettings;

const depsBase: ToAny<IExportAppDeps> = {
    'core.domain.sdo.export': mockExportDomain,
    'core.domain.sdo': mockSdoDomain,
    'core.infra.sdo.rabbitMQ': mockRabbitMQService,
    'core.utils.getSystemQueryContext': () => mockSystemQueryContext,
};

describe('exportApp', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupMockRabbitMQService();
        mockSdoDomain.getSDOGlobalSettings.mockResolvedValue(sdoGlobalSettings);
    });

    describe('onDataEvent()', () => {
        it('[-] Should log an error if the SDOConfig is not available', async () => {
            const noSdoError = new Error('[SDO] No SDO available');
            mockSdoDomain.getSDOGlobalSettings.mockRejectedValueOnce(noSdoError);

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            expect((await mockRabbitMQService.getLeavDataEventChannel()).nack).toHaveBeenCalledWith(
                mockDataEventMessage,
                false,
                false,
            );
        });

        it('[+] Should skip processing if message comes from systemUserId', async () => {
            const data = {userId: systemUserId};

            const msg = {
                content: Buffer.from(JSON.stringify(data)),
            } as ConsumeMessage;

            await exportApp(depsBase).onDataEvent(msg);

            expect(mockExportDomain.isSDODataEvent).not.toHaveBeenCalled();
            expect(mockExportDomain.process).not.toHaveBeenCalled();
            expect((await mockRabbitMQService.getLeavDataEventChannel()).ack).toHaveBeenCalledWith(msg);
        });

        it('[-] Should skip processing if feature flag is false', async () => {
            mockSdoDomain.getSDOGlobalSettings.mockResolvedValueOnce({
                ...sdoGlobalSettings,
                exportEnable: false,
            });

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            expect(mockExportDomain.isSDODataEvent).not.toHaveBeenCalled();
            expect(mockExportDomain.process).not.toHaveBeenCalled();
            expect((await mockRabbitMQService.getLeavDataEventChannel()).ack).toHaveBeenCalledWith(
                mockDataEventMessage,
            );
        });

        it('[+] Should skip processing if data is not SDO relevant', async () => {
            mockExportDomain.isSDODataEvent.mockResolvedValueOnce(false);

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            expect(mockExportDomain.isSDODataEvent).toHaveBeenCalledWith(mockDataEvent, sdoGlobalSettings.mapping);
            expect(mockExportDomain.process).not.toHaveBeenCalled();
            expect((await mockRabbitMQService.getLeavDataEventChannel()).ack).toHaveBeenCalledWith(
                mockDataEventMessage,
            );
        });

        it('[+] Should process SDO when event is valid', async () => {
            mockExportDomain.isSDODataEvent.mockResolvedValueOnce(true);
            mockExportDomain.process.mockImplementation(async (_data, _timer, callback) => {
                await callback('libId', 'recId');
            });
            mockSdoDomain.getRecordSDO.mockResolvedValueOnce(mockSDO);

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            expect(mockSdoDomain.getRecordSDO).toHaveBeenCalledWith(
                'libId',
                'recId',
                sdoGlobalSettings.mapping,
                mockSystemQueryContext,
            );
            expect(mockExportDomain.sendSDO).toHaveBeenCalledWith('libId', 'recId', mockSDO);
            expect((await mockRabbitMQService.getLeavDataEventChannel()).ack).toHaveBeenCalledWith(
                mockDataEventMessage,
            );
            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.SDO_LOG_EXPORT_RECORD,
                record: {id: 'recId', libraryId: 'libId'},
                sdo: mockSDO,
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] Should catch and log error inside process callback', async () => {
            const error = new Error('Process callback error');
            mockExportDomain.isSDODataEvent.mockResolvedValueOnce(true);
            mockSdoDomain.getRecordSDO.mockRejectedValueOnce(error);
            mockExportDomain.process.mockImplementation(async (_data, _timer, callback) => {
                await callback('libId', 'recId');
            });

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            expect((await mockRabbitMQService.getLeavDataEventChannel()).nack).toHaveBeenCalledWith(
                mockDataEventMessage,
                false,
                false,
            );

            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.SDO_LOG_ERROR,
                error: {
                    message: error.message,
                    stack: error.stack,
                },
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] Should catch and log LeavError error inside process callback', async () => {
            const error = new LeavError('Type', 'Process callback error', {
                fields: {field1: 'value1'},
                record: {id: 'recId', library: 'lib'},
            });

            mockExportDomain.isSDODataEvent.mockResolvedValueOnce(true);
            mockSdoDomain.getRecordSDO.mockRejectedValueOnce(error);
            mockExportDomain.process.mockImplementation(async (_data, _timer, callback) => {
                await callback('libId', 'recId');
            });

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            expect((await mockRabbitMQService.getLeavDataEventChannel()).nack).toHaveBeenCalledWith(
                mockDataEventMessage,
                false,
                false,
            );

            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.SDO_LOG_ERROR,
                error: {
                    message: error.message,
                    stack: error.stack,
                    fields: error.fields,
                    record: error.record,
                    type: error.type,
                    errorIdInStdout: error.errorId,
                },
                ctx: mockSystemQueryContext,
            });
        });
    });
});
