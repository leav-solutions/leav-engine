import {type IAmqpMessage} from '@leav/message-broker';
import {type ISDO, type ISDOMapping, type ISDOSettings} from '../../../_types/sdo';
import {type IDTO} from '../../../_types/dto';

export const mockDataEvent = {
    payload: {},
    userId: '123',
};

export const mockSDO: ISDO = {
    dataModelRelease: 'dataModelRelease',
    name: 'test',
    date: Date.now(),
    action: 'CREATE',
    content: {
        system: {
            systemId: '1',
            systemActive: true,
            systemCreator: 'created_id',
            systemCreationDate: Date.now(),
            systemLastModificator: 'modificator_id',
            systemLastModifiedDate: Date.now(),
            systemLabel: 'mock label',
        },
        simple: '123',
        simple_link: '1',
        advanced: ['value1', 'value2'],
        advanced_link: ['1', '2', '3'],
    },
};

export const mockDTO: IDTO = {
    dataModelRelease: 'dataModelRelease',
    requestId: '0f8c1aa3-6351-4578-ace6-1fd6b55e4944',
    operationId: 'a1559880-b232-449d-8027-b7e02faac354',
    correlationId: 'b3ae252d-7a24-4109-a75d-28dc1007032d',
    payloadType: 'test',
    method: 'UPDATE',
    payloadDocument: mockSDO.content,
};

export const mockDTOImportMessage = {
    content: Buffer.from(JSON.stringify(mockDTO)),
} as IAmqpMessage;

export const mockDataEventMessage = {
    content: Buffer.from(JSON.stringify(mockDataEvent)),
} as IAmqpMessage;

export const mockImportMessage = {
    content: Buffer.from(JSON.stringify(mockSDO)),
} as IAmqpMessage;

export const mockSDOMapping: ISDOMapping = {
    ['test']: {
        leavLibraryId: 'leavLibraryId',
        sdoAttributes: {
            simple: {
                leavAttributeId: 'simple',
                valueRequired: false,
                format: 'string',
            },
            simple_link: {
                leavAttributeId: 'simple_link',
                valueRequired: false,
                format: 'string',
            },
            advanced: {
                leavAttributeId: 'advanced',
                valueRequired: false,
                format: 'array',
            },
            advanced_link: {
                leavAttributeId: 'advanced_link',
                valueRequired: false,
                format: 'array',
            },
        },
    },
} satisfies ISDOMapping;

export const sdoGlobalSettings = {
    timer: 120000,
    mapping: {...mockSDOMapping},
} satisfies ISDOSettings;
