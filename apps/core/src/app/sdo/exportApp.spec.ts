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
import {mockConfig} from '../../__tests__/mocks/sdo/config';

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
    config: mockConfig,
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

            expect(mockExportDomain.getSDOExportTargets).not.toHaveBeenCalled();
            expect(mockExportDomain.process).not.toHaveBeenCalled();
            expect((await mockRabbitMQService.getLeavDataEventChannel()).ack).toHaveBeenCalledWith(msg);
        });

        it('[-] Should skip processing if feature flag is false', async () => {
            mockSdoDomain.getSDOGlobalSettings.mockResolvedValueOnce({
                ...sdoGlobalSettings,
                exportEnable: false,
            });

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            expect(mockExportDomain.getSDOExportTargets).not.toHaveBeenCalled();
            expect(mockExportDomain.process).not.toHaveBeenCalled();
            expect((await mockRabbitMQService.getLeavDataEventChannel()).ack).toHaveBeenCalledWith(
                mockDataEventMessage,
            );
        });

        it('[+] Should skip processing if no target was resolved', async () => {
            mockExportDomain.getSDOExportTargets.mockResolvedValueOnce([]);

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            expect(mockExportDomain.getSDOExportTargets).toHaveBeenCalledWith(
                mockDataEvent,
                sdoGlobalSettings.mapping,
                mockSystemQueryContext,
            );
            expect(mockExportDomain.process).not.toHaveBeenCalled();
            expect((await mockRabbitMQService.getLeavDataEventChannel()).ack).toHaveBeenCalledWith(
                mockDataEventMessage,
            );
        });

        it('[+] Should process SDO when a single target was resolved', async () => {
            mockExportDomain.getSDOExportTargets.mockResolvedValueOnce([
                {leavLibraryId: 'libId', recordId: 'recId', action: 'CREATE'},
            ]);
            mockExportDomain.process.mockImplementation(async (libraryId, recordId, _timer, callback) => {
                await callback(libraryId, recordId);
            });
            mockSdoDomain.getRecordSDO.mockResolvedValueOnce(mockSDO);

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            expect(mockExportDomain.process).toHaveBeenCalledWith(
                'libId',
                'recId',
                sdoGlobalSettings.timer,
                expect.any(Function),
            );
            expect(mockSdoDomain.getRecordSDO).toHaveBeenCalledWith(
                'libId',
                'recId',
                sdoGlobalSettings.mapping,
                'CREATE',
                mockSystemQueryContext,
            );
            // sending the SDO (including hash checking/persisting and logging) is delegated
            // to sdoExportDomain.sendSDO - covered by sdoExportDomain.spec.ts
            expect(mockExportDomain.sendSDO).toHaveBeenCalledWith('libId', 'recId', mockSDO);
            expect((await mockRabbitMQService.getLeavDataEventChannel()).ack).toHaveBeenCalledWith(
                mockDataEventMessage,
            );
        });

        it('[+] Should process every resolved target independently', async () => {
            mockExportDomain.getSDOExportTargets.mockResolvedValueOnce([
                {leavLibraryId: 'campaigns', recordId: 'campaign1', action: 'UPDATE'},
                {leavLibraryId: 'map', recordId: 'map1', action: 'UPDATE'},
            ]);
            mockExportDomain.process.mockImplementation(async (libraryId, recordId, _timer, callback) => {
                await callback(libraryId, recordId);
            });
            mockSdoDomain.getRecordSDO.mockResolvedValue(mockSDO);

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            expect(mockExportDomain.process).toHaveBeenCalledTimes(2);
            expect(mockSdoDomain.getRecordSDO).toHaveBeenCalledWith(
                'campaigns',
                'campaign1',
                sdoGlobalSettings.mapping,
                'UPDATE',
                mockSystemQueryContext,
            );
            expect(mockSdoDomain.getRecordSDO).toHaveBeenCalledWith(
                'map',
                'map1',
                sdoGlobalSettings.mapping,
                'UPDATE',
                mockSystemQueryContext,
            );
            expect((await mockRabbitMQService.getLeavDataEventChannel()).ack).toHaveBeenCalledWith(
                mockDataEventMessage,
            );
        });

        it('[-] Should nack the message if sendSDO fails', async () => {
            mockExportDomain.getSDOExportTargets.mockResolvedValueOnce([
                {leavLibraryId: 'libId', recordId: 'recId', action: 'CREATE'},
            ]);
            mockExportDomain.process.mockImplementation(async (libraryId, recordId, _timer, callback) => {
                await callback(libraryId, recordId);
            });
            mockSdoDomain.getRecordSDO.mockResolvedValueOnce(mockSDO);
            mockExportDomain.sendSDO.mockRejectedValueOnce(new Error('publish failed'));

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            expect((await mockRabbitMQService.getLeavDataEventChannel()).nack).toHaveBeenCalledWith(
                mockDataEventMessage,
                false,
                false,
            );
        });

        it('[-] Should nack the whole message when one of several targets fails, after logging each failure', async () => {
            mockExportDomain.getSDOExportTargets.mockResolvedValueOnce([
                {leavLibraryId: 'campaigns', recordId: 'campaign1', action: 'UPDATE'},
                {leavLibraryId: 'map', recordId: 'map1', action: 'UPDATE'},
            ]);
            mockExportDomain.process.mockImplementation(async (libraryId, recordId, _timer, callback) => {
                await callback(libraryId, recordId);
            });
            mockSdoDomain.getRecordSDO.mockImplementation(async leavLibrary => {
                if (leavLibrary === 'map') {
                    throw new Error('bad additionalLibraryTriggers config');
                }
                return mockSDO;
            });

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            // The successful target's SDO was still sent, despite the sibling target's failure.
            expect(mockExportDomain.sendSDO).toHaveBeenCalledWith('campaigns', 'campaign1', mockSDO);
            expect((await mockRabbitMQService.getLeavDataEventChannel()).nack).toHaveBeenCalledWith(
                mockDataEventMessage,
                false,
                false,
            );
        });

        it('[-] Should catch and log error inside process callback', async () => {
            const error = new Error('Process callback error');
            mockExportDomain.getSDOExportTargets.mockResolvedValueOnce([
                {leavLibraryId: 'libId', recordId: 'recId', action: 'CREATE'},
            ]);
            mockSdoDomain.getRecordSDO.mockRejectedValueOnce(error);
            mockExportDomain.process.mockImplementation(async (libraryId, recordId, _timer, callback) => {
                await callback(libraryId, recordId);
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

            mockExportDomain.getSDOExportTargets.mockResolvedValueOnce([
                {leavLibraryId: 'libId', recordId: 'recId', action: 'CREATE'},
            ]);
            mockSdoDomain.getRecordSDO.mockRejectedValueOnce(error);
            mockExportDomain.process.mockImplementation(async (libraryId, recordId, _timer, callback) => {
                await callback(libraryId, recordId);
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
