import {type ConsumeMessage} from 'amqplib';
import {type ISDO, type ISDOMapping, type ISDOSettings} from '../../../_types/sdo';

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
        },
        simple: '123',
        simple_link: '1',
        advanced: ['value1', 'value2'],
        advanced_link: ['1', '2', '3'],
    },
};

export const mockDataEventMessage = {
    content: Buffer.from(JSON.stringify(mockDataEvent)),
} as ConsumeMessage;

export const mockImportMessage = {
    content: Buffer.from(JSON.stringify(mockSDO)),
} as ConsumeMessage;

export const mockSDOMapping: ISDOMapping = {
    ['test']: {
        leavLibraryId: 'leavLibraryId',
        sdoAttributes: {
            'system.systemId': {
                leavAttributeId: 'uuid',
                valueRequired: false,
                format: 'string',
            },
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
