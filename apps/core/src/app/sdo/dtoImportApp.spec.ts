import {type IAmqpMessage} from '@leav/message-broker';
import {type ToAny} from '../../utils/utils';
import {default as dtoImportApp, type IDTOImportAppDeps} from './dtoImportApp';
import {mockDTO, mockDTOImportMessage} from '../../__tests__/mocks/sdo/data';
import {mockSdoDomain} from '../../__tests__/mocks/sdo/domains';
import {mockConfig} from '../../__tests__/mocks/sdo/config';
import ValidationError from '../../errors/ValidationError';

const depsBase: ToAny<IDTOImportAppDeps> = {
    'core.domain.sdo': mockSdoDomain,
    config: mockConfig,
};

const _messageFor = (dto: unknown): IAmqpMessage =>
    ({
        content: Buffer.from(JSON.stringify(dto)),
    }) as IAmqpMessage;

describe('dtoImportApp', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('onDTOEvent()', () => {
        it('[+] should validate the payload document of a well-formed operation', async () => {
            await dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage);

            expect(mockSdoDomain.schemaValidation).toHaveBeenCalledTimes(1);
            expect(mockSdoDomain.schemaValidation).toHaveBeenCalledWith(mockDTO.payloadDocument);
        });

        it('[+] should accept a "CREATE" operation', async () => {
            await dtoImportApp(depsBase).onDTOEvent(_messageFor({...mockDTO, method: 'CREATE'}));

            expect(mockSdoDomain.schemaValidation).toHaveBeenCalledTimes(1);
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
        });

        it('[-] should reject if message is not a valid JSON', async () => {
            const invalidMsg = {
                content: Buffer.from('invalid-json'),
            } as IAmqpMessage;

            await expect(dtoImportApp(depsBase).onDTOEvent(invalidMsg)).rejects.toThrow();
        });
    });
});
