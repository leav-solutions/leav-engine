import {type ToAny} from '../../utils/utils';
import {default as importApp, type IImportAppDeps} from './importApp';
import {type ConsumeMessage} from 'amqplib';
import mockRabbitMQService, {setupMockRabbitMQService} from '../../__tests__/mocks/sdo/rabbitMQ';
import {mockImportMessage, mockSDO} from '../../__tests__/mocks/sdo/data';
import {EventAction} from '@leav/utils';
import ValidationError from '../../errors/ValidationError';
import {mockImportDomain, mockSdoDomain} from '../../__tests__/mocks/sdo/domains';
import {mockSystemQueryContext} from '../../__tests__/mocks/sdo/core';
import {ISDOSettings} from '../../_types/sdo';

const depsBase: ToAny<IImportAppDeps> = {
    'core.infra.sdo.rabbitMQ': mockRabbitMQService,
    'core.domain.sdo': mockSdoDomain,
    'core.domain.sdo.import': mockImportDomain,
    'core.utils.getSystemQueryContext': () => mockSystemQueryContext,
};

const sdoGlobalSettings = {};

describe('importApp', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupMockRabbitMQService();
        mockSdoDomain.getSDOGlobalSettings.mockResolvedValue(sdoGlobalSettings);
    });

    describe('dispatch()', () => {
        it('[+] should dispatch properly "create" message', async () => {
            // A specific importMessage and mockSDO are used here due to temporary explicit references
            // to the campaign and map libraries in the onSDOEvent function.
            const sdo = {...mockSDO, name: 'campaign'};
            const importMessage = {
                ...mockImportMessage,
                content: Buffer.from(JSON.stringify(sdo)),
            };

            await importApp(depsBase).onSDOEvent(importMessage);

            expect(mockImportDomain.create).toHaveBeenCalledTimes(1);
            expect(mockImportDomain.create).toHaveBeenCalledWith(sdo, mockSystemQueryContext);

            expect((await mockRabbitMQService.getSDOImportChannel()).ack).toHaveBeenCalledWith(importMessage);
            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.SDO_LOG_IMPORT_RECORD,
                sdo,
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] Should skip processing if feature flag is false', async () => {
            mockSdoDomain.getSDOGlobalSettings.mockResolvedValueOnce({
                ...sdoGlobalSettings,
                importEnable: false,
            });

            await importApp(depsBase).onSDOEvent(mockImportMessage);

            expect(mockImportDomain.create).not.toHaveBeenCalled();
            expect((await mockRabbitMQService.getSDOImportChannel()).ack).toHaveBeenCalledWith(mockImportMessage);
        });

        it('[-] Should process if feature flag is true', async () => {
            const sdo = {...mockSDO, name: 'campaign'};
            const importMessage = {
                ...mockImportMessage,
                content: Buffer.from(JSON.stringify(sdo)),
            };

            mockSdoDomain.getSDOGlobalSettings.mockResolvedValueOnce({
                ...sdoGlobalSettings,
                importEnable: true,
            });

            await importApp(depsBase).onSDOEvent(importMessage);

            expect(mockImportDomain.create).toHaveBeenCalled();
            expect((await mockRabbitMQService.getSDOImportChannel()).ack).toHaveBeenCalledWith(importMessage);
        });

        it('[+] should dispatch properly "update" message', async () => {
            // A specific importMessage and mockSDO are used here due to temporary explicit references
            // to the campaign and map libraries in the onSDOEvent function.
            const sdo = {...mockSDO, name: 'campaign', action: 'UPDATE'};
            const importMessage = {
                ...mockImportMessage,
                content: Buffer.from(JSON.stringify(sdo)),
            };

            await importApp(depsBase).onSDOEvent(importMessage);

            expect(mockImportDomain.update).toHaveBeenCalledTimes(1);
            expect(mockImportDomain.update).toHaveBeenCalledWith(sdo, mockSystemQueryContext);

            expect((await mockRabbitMQService.getSDOImportChannel()).ack).toHaveBeenCalledWith(importMessage);
            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.SDO_LOG_IMPORT_RECORD,
                sdo,
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] should nack if action does not exists', async () => {
            const sdo = {...mockSDO, name: 'campaign', action: 'UNKNOWN'};

            const importMessage = {
                ...mockImportMessage,
                content: Buffer.from(JSON.stringify(sdo)),
            };

            await importApp(depsBase).onSDOEvent(importMessage);

            expect((await mockRabbitMQService.getSDOImportChannel()).nack).toHaveBeenCalledWith(
                importMessage,
                false,
                false,
            );
            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.SDO_LOG_ERROR,
                error: {
                    message: 'Unexpected action',
                    stack: expect.any(String),
                },
                sdo,
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] should nack if schema validation throw', async () => {
            const mockData = {
                name: 'campaign',
                action: 'CREATE',
            };

            const mockMsg = {
                content: Buffer.from(JSON.stringify(mockData)),
            } as ConsumeMessage;

            const validationError = new ValidationError({dontcare: 'error-field'}, 'Schema validation error');

            mockSdoDomain.schemaValidation.mockRejectedValueOnce(validationError);

            await importApp(depsBase).onSDOEvent(mockMsg);

            expect((await mockRabbitMQService.getSDOImportChannel()).nack).toHaveBeenCalledWith(mockMsg, false, false);
            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.SDO_LOG_ERROR,
                error: {
                    message: 'Schema validation error',
                    stack: validationError.stack,
                    fields: validationError.fields,
                    record: validationError.record,
                    type: validationError.type,
                    errorIdInStdout: validationError.errorId,
                },
                sdo: mockData,
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] should nack if message is not a valid JSON', async () => {
            const invalidMsg = {
                content: Buffer.from('invalid-json'),
            } as ConsumeMessage;

            await importApp(depsBase).onSDOEvent(invalidMsg);

            expect((await mockRabbitMQService.getSDOImportChannel()).nack).toHaveBeenCalledWith(
                invalidMsg,
                false,
                false,
            );
        });
    });
});
