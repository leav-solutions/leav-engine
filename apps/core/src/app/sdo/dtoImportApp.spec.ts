import {type IAmqpMessage} from '@leav/message-broker';
import {EventAction} from '@leav/utils';
import {type ToAny} from '../../utils/utils';
import {default as dtoImportApp, type IDTOImportAppDeps} from './dtoImportApp';
import {mockDTO, mockDTOImportMessage, sdoGlobalSettings} from '../../__tests__/mocks/sdo/data';
import {mockImportDomain, mockSdoDomain} from '../../__tests__/mocks/sdo/domains';
import {mockConfig} from '../../__tests__/mocks/sdo/config';
import {mockSystemQueryContext} from '../../__tests__/mocks/sdo/core';
import ValidationError from '../../errors/ValidationError';

const depsBase: ToAny<IDTOImportAppDeps> = {
    'core.domain.sdo': mockSdoDomain,
    'core.domain.sdo.import': mockImportDomain,
    'core.utils.getSystemQueryContext': () => mockSystemQueryContext,
    config: mockConfig,
};

const _messageFor = (dto: unknown): IAmqpMessage =>
    ({
        content: Buffer.from(JSON.stringify(dto)),
    }) as IAmqpMessage;

describe('dtoImportApp', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mockSdoDomain.getSDOGlobalSettings.mockResolvedValue({...sdoGlobalSettings, importEnable: true});
    });

    describe('onDTOEvent()', () => {
        it('[+] should validate the payload document of a well-formed operation', async () => {
            await dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage);

            expect(mockSdoDomain.schemaValidation).toHaveBeenCalledTimes(1);
            expect(mockSdoDomain.schemaValidation).toHaveBeenCalledWith(mockDTO.payloadDocument);
        });

        it('[+] should apply an "UPDATE" operation through the SDO import domain', async () => {
            await dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage);

            expect(mockImportDomain.update).toHaveBeenCalledTimes(1);
            expect(mockImportDomain.update).toHaveBeenCalledWith(
                {name: mockDTO.payloadType, content: mockDTO.payloadDocument},
                mockSystemQueryContext,
            );
            expect(mockImportDomain.create).not.toHaveBeenCalled();
        });

        it('[+] should apply a "CREATE" operation through the SDO import domain', async () => {
            await dtoImportApp(depsBase).onDTOEvent(_messageFor({...mockDTO, method: 'CREATE'}));

            expect(mockImportDomain.create).toHaveBeenCalledTimes(1);
            expect(mockImportDomain.create).toHaveBeenCalledWith(
                {name: mockDTO.payloadType, content: mockDTO.payloadDocument},
                mockSystemQueryContext,
            );
            expect(mockImportDomain.update).not.toHaveBeenCalled();
        });

        it('[+] should send an import log on success', async () => {
            await dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage);

            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.DTO_LOG_IMPORT_RECORD,
                dto: mockDTO,
                ctx: mockSystemQueryContext,
            });
        });

        it('[+] should ignore the operation when imports are globally disabled', async () => {
            mockSdoDomain.getSDOGlobalSettings.mockResolvedValue({...sdoGlobalSettings, importEnable: false});

            await dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage);

            expect(mockSdoDomain.schemaValidation).not.toHaveBeenCalled();
            expect(mockImportDomain.create).not.toHaveBeenCalled();
            expect(mockImportDomain.update).not.toHaveBeenCalled();
            expect(mockSdoDomain.sendLog).not.toHaveBeenCalled();
        });

        it('[-] should reject an operation missing envelope fields', async () => {
            const {operationId: _operationId, payloadDocument: _payloadDocument, ...incompleteDTO} = mockDTO;

            await expect(dtoImportApp(depsBase).onDTOEvent(_messageFor(incompleteDTO))).rejects.toThrow(
                'missing operationId, payloadDocument',
            );

            expect(mockSdoDomain.schemaValidation).not.toHaveBeenCalled();
        });

        it('[-] should reject an unsupported method', async () => {
            await expect(
                dtoImportApp(depsBase).onDTOEvent(_messageFor({...mockDTO, method: 'DELETE'})),
            ).rejects.toThrow('unsupported method DELETE');

            expect(mockSdoDomain.schemaValidation).not.toHaveBeenCalled();
        });

        it('[-] should reject if payload document schema validation throws', async () => {
            const validationError = new ValidationError({dontcare: 'error-field'}, 'Schema validation error');
            mockSdoDomain.schemaValidation.mockRejectedValueOnce(validationError);

            await expect(dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage)).rejects.toThrow(validationError);

            expect(mockImportDomain.update).not.toHaveBeenCalled();
        });

        it('[-] should reject if message is not a valid JSON', async () => {
            const invalidMsg = {
                content: Buffer.from('invalid-json'),
            } as IAmqpMessage;

            await expect(dtoImportApp(depsBase).onDTOEvent(invalidMsg)).rejects.toThrow();
        });

        it('[-] should send an error log then rethrow when the import domain fails', async () => {
            const importError = new Error('Record not found');
            mockImportDomain.update.mockRejectedValueOnce(importError);

            await expect(dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage)).rejects.toThrow(importError);

            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.DTO_LOG_ERROR,
                error: {message: 'Record not found', stack: expect.any(String)},
                dto: mockDTO,
                ctx: mockSystemQueryContext,
            });
        });
    });
});
