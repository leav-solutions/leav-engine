// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import {EventAction} from '@leav/utils';
import * as amqp from 'amqplib';
import {IUtils} from 'utils/utils';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {mockCtx} from '../../__tests__/mocks/shared';
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

    const mockAmqpService: Mockify<IAmqpService> = {
        consume: jest.fn(),
        consumer: {
            connection: mockAmqpConnection as amqp.Connection,
            channel: mockAmqpChannel as amqp.ConfirmChannel
        },
        publish: global.__mockPromise(),
        publisher: {
            connection: mockAmqpConnection as amqp.Connection,
            channel: mockAmqpChannel as amqp.ConfirmChannel
        },
        close: jest.fn()
    };

    const mockUtils: Mockify<IUtils> = {
        getProcessIdentifier: jest.fn().mockReturnValue('98765431-42')
    };

    test('Init', async () => {
        const events = eventsManager({
            config: conf as IConfig,
            'core.utils.logger': logger as winston.Winston,
            'core.infra.amqpService': mockAmqpService as IAmqpService
        });

        await events.initPubSubEventsConsumer();

        expect(mockAmqpService.consume).toBeCalledTimes(1);
    });

    test('send database event', async () => {
        const events = eventsManager({
            config: conf as IConfig,
            'core.infra.amqpService': mockAmqpService as IAmqpService,
            'core.utils': mockUtils as IUtils
        });

        await events.sendDatabaseEvent(
            {action: EventAction.LIBRARY_SAVE, topic: {library: 'test'}, after: {id: 'test'}},
            ctx
        );

        expect(mockAmqpService.publish).toBeCalledTimes(1);
    });

    test('send pubsub event', async () => {
        const events = eventsManager({
            config: conf as IConfig,
            'core.infra.amqpService': mockAmqpService as IAmqpService,
            'core.utils': mockUtils as IUtils
        });

        await events.sendPubSubEvent({triggerName: 'test', data: {}}, ctx);

        expect(mockAmqpService.publish).toBeCalledTimes(1);
    });

    describe('registerEventActions', () => {
        test('registerEventActions', () => {
            const events = eventsManager({
                config: conf as IConfig,
                'core.utils.logger': logger as winston.Winston,
                'core.infra.amqpService': mockAmqpService as IAmqpService
            });

            const actions = ['myplugin_ACTION1', 'myplugin_ACTION2', 'myplugin_ACTION3'];
            events.registerEventActions(actions, 'myplugin', mockCtx);

            const actionsSaved = events.getActions();

            expect(actionsSaved).toContain('myplugin_ACTION1');
            expect(actionsSaved).toContain('myplugin_ACTION2');
            expect(actionsSaved).toContain('myplugin_ACTION3');
        });

        test('Should throw if actions are not prefixed', async () => {
            const events = eventsManager({
                config: conf as IConfig,
                'core.utils.logger': logger as winston.Winston,
                'core.infra.amqpService': mockAmqpService as IAmqpService
            });

            const actions = ['action1', 'action2', 'action3'];

            expect(() => events.registerEventActions(actions, 'myplugin', mockCtx)).toThrow();
        });
    });
});
