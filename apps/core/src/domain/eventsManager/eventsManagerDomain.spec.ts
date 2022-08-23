// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IAmqpService, amqpService} from '@leav/message-broker';
import {EventAction} from '../../_types/event';
import eventsManager from './eventsManagerDomain';
import winston = require('winston');

const logger: Mockify<winston.Winston> = {
    error: jest.fn((...args) => console.log(args)), // eslint-disable-line no-restricted-syntax
    warn: jest.fn((...args) => console.log(args)) // eslint-disable-line no-restricted-syntax
};

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    assertExchange: jest.fn(),
    checkExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    publish: jest.fn(),
    waitForConfirms: jest.fn(),
    prefetch: jest.fn()
};

const mockAmqpConnection: Mockify<amqp.Connection> = {
    close: jest.fn(),
    createConfirmChannel: jest.fn().mockReturnValue(mockAmqpChannel)
};

jest.mock('amqplib', () => ({
    connect: jest.fn().mockImplementation(() => mockAmqpConnection)
}));

const ctx: IQueryInfos = {
    userId: '1',
    queryId: 'eventsManagerDomainTest'
};

describe('Events Manager', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const conf: Mockify<IConfig> = {
        amqp: {
            exchange: 'test_exchange',
            connOpt: {
                protocol: 'amqp',
                hostname: 'localhost',
                username: 'user',
                password: 'user',
                port: 1234
            },
            type: 'direct'
        },
        eventsManager: {
            routingKeys: {
                data_events: 'test.data.events',
                pubsub_events: 'test.pubsub.events'
            },
            queues: {
                pubsub_events: 'test_pubsub_events'
            }
        }
    };

    test('Init', async () => {
        const amqpServ = await amqpService({
            config: conf.amqp
        });

        const events = eventsManager({
            config: conf as IConfig,
            'core.utils.logger': logger as winston.Winston,
            'core.infra.amqpService': amqpServ as IAmqpService
        });

        await events.init();

        expect(mockAmqpChannel.consume).toBeCalledTimes(1);
    });

    test('send database event', async () => {
        const amqpServ = await amqpService({
            config: conf.amqp
        });

        const events = eventsManager({
            config: conf as IConfig,
            'core.infra.amqpService': amqpServ as IAmqpService
        });

        await events.sendDatabaseEvent({action: EventAction.LIBRARY_SAVE, data: {new: {id: 'test'}}}, ctx);

        expect(mockAmqpChannel.publish).toBeCalledTimes(1);
    });

    test('send pubsub event', async () => {
        const amqpServ = await amqpService({
            config: conf.amqp
        });

        const events = eventsManager({
            config: conf as IConfig,
            'core.infra.amqpService': amqpServ as IAmqpService
        });

        await events.sendPubSubEvent({triggerName: 'test', data: {}}, ctx);

        expect(mockAmqpChannel.publish).toBeCalledTimes(1);
    });
});
