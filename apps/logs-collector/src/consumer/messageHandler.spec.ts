// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Client} from '@elastic/elasticsearch';
import * as amqp from 'amqplib';
import {IConfig} from '_types/config';
import {mockMessage} from '__tests__/mocks/message';
import {handleMessage} from './messageHandler';

jest.mock('../elasticsearchService', () => ({
    writeData: jest.fn()
}));

describe('handleMessage', () => {
    test('Should create index if it does not exist', async () => {
        const esClient = {
            indices: {
                create: jest.fn(() => Promise.resolve())
            },
            index: jest.fn(() => Promise.resolve())
        } as unknown as Client;

        const channel = {
            ack: jest.fn()
        } as unknown as amqp.ConfirmChannel;

        const config = {
            amqp: {
                queue: 'queue',
                routingKey: 'routingKey'
            }
        };

        const msg = Buffer.from(JSON.stringify(mockMessage));

        await handleMessage({content: msg, fields: null, properties: null}, channel, config as IConfig, esClient);

        expect(require('../elasticsearchService').writeData).toHaveBeenCalled();
    });
});
