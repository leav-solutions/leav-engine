import {type IAmqpMessage} from '@leav/message-broker';
import {type ToAny} from '../../utils/utils';
import {default as importApp, type IImportAppDeps} from './importApp';
import {mockImportMessage, mockSDO} from '../../__tests__/mocks/sdo/data';
import {EventAction} from '@leav/utils';
import ValidationError from '../../errors/ValidationError';
import {mockImportDomain, mockSdoDomain} from '../../__tests__/mocks/sdo/domains';
import {mockSystemQueryContext} from '../../__tests__/mocks/sdo/core';
import {mockConfig} from '../../__tests__/mocks/sdo/config';

const depsBase: ToAny<IImportAppDeps> = {
    'core.domain.sdo': mockSdoDomain,
    'core.domain.sdo.import': mockImportDomain,
    'core.utils.getSystemQueryContext': () => mockSystemQueryContext,
    config: mockConfig,
};

const sdoGlobalSettings = {};

describe('importApp', () => {
    beforeEach(() => {
        vi.resetAllMocks();
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

            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.SDO_LOG_IMPORT_RECORD,
                sdo,
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] should ignore and ack a message emitted by itself (same clientId)', async () => {
            const sdo = {...mockSDO, name: 'campaign', clientId: mockConfig.sdo.clientId};
            const importMessage = {
                ...mockImportMessage,
                content: Buffer.from(JSON.stringify(sdo)),
            };

            await importApp(depsBase).onSDOEvent(importMessage);

            expect(mockImportDomain.create).not.toHaveBeenCalled();
            expect(mockImportDomain.update).not.toHaveBeenCalled();
        });

        it('[-] Should skip processing if feature flag is false', async () => {
            mockSdoDomain.getSDOGlobalSettings.mockResolvedValueOnce({
                ...sdoGlobalSettings,
                importEnable: false,
            });

            await importApp(depsBase).onSDOEvent(mockImportMessage);

            expect(mockImportDomain.create).not.toHaveBeenCalled();
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

            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.SDO_LOG_IMPORT_RECORD,
                sdo,
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] should reject if action does not exists', async () => {
            const sdo = {...mockSDO, name: 'campaign', action: 'UNKNOWN'};

            const importMessage = {
                ...mockImportMessage,
                content: Buffer.from(JSON.stringify(sdo)),
            };

            await expect(importApp(depsBase).onSDOEvent(importMessage)).rejects.toThrow('Unexpected action');

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

        it('[-] should reject if schema validation throw', async () => {
            const mockData = {
                name: 'campaign',
                action: 'CREATE',
            };

            const mockMsg = {
                content: Buffer.from(JSON.stringify(mockData)),
            } as IAmqpMessage;

            const validationError = new ValidationError({dontcare: 'error-field'}, 'Schema validation error');

            mockSdoDomain.schemaValidation.mockRejectedValueOnce(validationError);

            await expect(importApp(depsBase).onSDOEvent(mockMsg)).rejects.toThrow(validationError);

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

        it('[-] should reject if message is not a valid JSON', async () => {
            const invalidMsg = {
                content: Buffer.from('invalid-json'),
            } as IAmqpMessage;

            await expect(importApp(depsBase).onSDOEvent(invalidMsg)).rejects.toThrow();
        });
    });
});
