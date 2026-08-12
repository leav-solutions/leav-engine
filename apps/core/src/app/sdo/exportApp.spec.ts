import {type IAmqpMessage} from '@leav/message-broker';
import {type ToAny} from '../../utils/utils';
import {type IExportAppDeps, default as exportApp} from './exportApp';
import {sdoPathIdentifierUuid, type ISDOSettings} from '../../_types/sdo';
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
    'core.utils.getSystemQueryContext': () => mockSystemQueryContext,
    config: mockConfig,
};

describe('exportApp', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mockSdoDomain.getSDOGlobalSettings.mockResolvedValue(sdoGlobalSettings);
    });

    describe('onDataEvent()', () => {
        it('[-] Should reject and log an error if the SDOConfig is not available', async () => {
            const noSdoError = new Error('[SDO] No SDO available');
            mockSdoDomain.getSDOGlobalSettings.mockRejectedValueOnce(noSdoError);

            await expect(exportApp(depsBase).onDataEvent(mockDataEventMessage)).rejects.toThrow(noSdoError);
        });

        it('[+] Should skip processing if message comes from systemUserId', async () => {
            const data = {userId: systemUserId};

            const msg = {
                content: Buffer.from(JSON.stringify(data)),
            } as IAmqpMessage;

            await exportApp(depsBase).onDataEvent(msg);

            expect(mockExportDomain.getSDOExportTargets).not.toHaveBeenCalled();
            expect(mockExportDomain.process).not.toHaveBeenCalled();
        });

        it('[-] Should skip processing if feature flag is false', async () => {
            mockSdoDomain.getSDOGlobalSettings.mockResolvedValueOnce({
                ...sdoGlobalSettings,
                exportEnable: false,
            });

            await exportApp(depsBase).onDataEvent(mockDataEventMessage);

            expect(mockExportDomain.getSDOExportTargets).not.toHaveBeenCalled();
            expect(mockExportDomain.process).not.toHaveBeenCalled();
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
        });

        it('[+] Should not send the SDO when getRecordSDO returns null', async () => {
            // getRecordSDO returns null for a record still in creation. The message must be acked
            // (no throw): the export will happen on the event emitted by activateNewRecord.
            mockExportDomain.getSDOExportTargets.mockResolvedValueOnce([
                {leavLibraryId: 'libId', recordId: 'recId', action: 'CREATE'},
            ]);
            mockExportDomain.process.mockImplementation(async (libraryId, recordId, _timer, callback) => {
                await callback(libraryId, recordId);
            });
            mockSdoDomain.getRecordSDO.mockResolvedValueOnce(null);

            await expect(exportApp(depsBase).onDataEvent(mockDataEventMessage)).resolves.not.toThrow();

            expect(mockSdoDomain.getRecordSDO).toHaveBeenCalledTimes(1);
            expect(mockExportDomain.sendSDO).not.toHaveBeenCalled();
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
        });

        it('[-] Should reject if sendSDO fails', async () => {
            mockExportDomain.getSDOExportTargets.mockResolvedValueOnce([
                {leavLibraryId: 'libId', recordId: 'recId', action: 'CREATE'},
            ]);
            mockExportDomain.process.mockImplementation(async (libraryId, recordId, _timer, callback) => {
                await callback(libraryId, recordId);
            });
            mockSdoDomain.getRecordSDO.mockResolvedValueOnce(mockSDO);
            mockExportDomain.sendSDO.mockRejectedValueOnce(new Error('publish failed'));

            await expect(exportApp(depsBase).onDataEvent(mockDataEventMessage)).rejects.toThrow('publish failed');
        });

        it('[-] Should reject with the first target failure, after logging every failure', async () => {
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

            await expect(exportApp(depsBase).onDataEvent(mockDataEventMessage)).rejects.toThrow(
                'bad additionalLibraryTriggers config',
            );

            // The successful target's SDO was still sent, despite the sibling target's failure.
            expect(mockExportDomain.sendSDO).toHaveBeenCalledWith('campaigns', 'campaign1', mockSDO);
        });

        it('[-] Should reject and log error inside process callback', async () => {
            const error = new Error('Process callback error');
            mockExportDomain.getSDOExportTargets.mockResolvedValueOnce([
                {leavLibraryId: 'libId', recordId: 'recId', action: 'CREATE'},
            ]);
            mockSdoDomain.getRecordSDO.mockRejectedValueOnce(error);
            mockExportDomain.process.mockImplementation(async (libraryId, recordId, _timer, callback) => {
                await callback(libraryId, recordId);
            });

            await expect(exportApp(depsBase).onDataEvent(mockDataEventMessage)).rejects.toThrow(error);

            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.SDO_EXPORT_ERROR,
                error: {
                    message: error.message,
                    stack: error.stack,
                },
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] Should reject and log LeavError error inside process callback', async () => {
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

            await expect(exportApp(depsBase).onDataEvent(mockDataEventMessage)).rejects.toThrow(error);

            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.SDO_EXPORT_ERROR,
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
