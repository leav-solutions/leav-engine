import {type IAmqpService} from '@leav/message-broker';
import {EventAction} from '@leav/utils';
import type * as amqp from 'amqplib';
import {type IUtils, type ToAny} from '../../utils/utils';
import {type IConfig} from '../../_types/config';
import {type IQueryInfos} from '../../_types/queryInfos';
import {mockCtx} from '../../__tests__/mocks/shared';
import eventsManager, {type IEventsManagerDomainDeps} from './eventsManagerDomain';
import {type ILogger} from '@leav/logger';

const logger: Mockify<ILogger> = {
    error: vi.fn((...args) => console.log(args)),
    warn: vi.fn((...args) => console.log(args)),
};

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    assertExchange: vi.fn(),
    checkExchange: vi.fn(),
    assertQueue: vi.fn(),
    bindQueue: vi.fn(),
    consume: vi.fn(),
    publish: vi.fn(),
    waitForConfirms: vi.fn(),
    prefetch: vi.fn(),
};

const mockAmqpConnection: Mockify<amqp.ChannelModel> = {
    close: vi.fn(),
    createConfirmChannel: vi.fn().mockReturnValue(mockAmqpChannel),
};

vi.mock('amqplib', () => ({
    connect: vi.fn().mockImplementation(() => mockAmqpConnection),
}));

const ctx: IQueryInfos = {
    userId: '1',
    queryId: 'eventsManagerDomainTest',
};

const depsBase: ToAny<IEventsManagerDomainDeps> = {
    config: {},
    'core.infra.amqpService': vi.fn(),
    'core.utils.logger': vi.fn(),
    'core.utils': vi.fn(),
};

describe('Events Manager', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const conf: Mockify<IConfig> = {
        amqp: {
            exchange: 'test_exchange',
            connOpt: {
                protocol: 'amqp',
                hostname: 'localhost',
                username: 'user',
                password: 'user',
                port: 1234,
            },
            type: 'direct',
        },
        eventsManager: {
            routingKeys: {
                data_events: 'test.data.events',
                pubsub_events: 'test.pubsub.events',
            },
            queues: {
                pubsub_events_prefix: 'test_pubsub_events-',
            },
        },
    };

    const mockAmqpService: Mockify<IAmqpService> = {
        consume: vi.fn(),
        consumer: {
            connection: mockAmqpConnection as amqp.ChannelModel,
            channel: mockAmqpChannel as amqp.ConfirmChannel,
        },
        publish: global.__mockPromise(),
        publisher: {
            connection: mockAmqpConnection as amqp.ChannelModel,
            channel: mockAmqpChannel as amqp.ConfirmChannel,
        },
        close: vi.fn(),
    };

    const mockUtils: Mockify<IUtils> = {
        getProcessIdentifier: vi.fn().mockReturnValue('98765431-42'),
    };

    test('Init', async () => {
        const events = eventsManager({
            ...depsBase,
            config: conf as IConfig,
            'core.utils.logger': logger as ILogger,
            'core.infra.amqpService': mockAmqpService as IAmqpService,
        });

        await events.initPubSubEventsConsumer();

        expect(mockAmqpService.consume).toBeCalledTimes(1);
    });

    test('send database event', async () => {
        const events = eventsManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.amqpService': mockAmqpService as IAmqpService,
            'core.utils': mockUtils as IUtils,
        });

        await events.sendDatabaseEvent<EventAction.LIBRARY_SAVE>(
            {action: EventAction.LIBRARY_SAVE, topic: {library: 'test'}, after: {id: 'test'}},
            ctx,
        );

        expect(mockAmqpService.publish).toBeCalledTimes(1);
    });

    test('send pubsub event', async () => {
        const events = eventsManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.amqpService': mockAmqpService as IAmqpService,
            'core.utils': mockUtils as IUtils,
        });

        await events.sendPubSubEvent({triggerName: 'test', data: {}}, ctx);

        expect(mockAmqpService.publish).toBeCalledTimes(1);
    });

    describe('registerEventActions', () => {
        test('registerEventActions', () => {
            const events = eventsManager({
                ...depsBase,
                config: conf as IConfig,
                'core.utils.logger': logger as ILogger,
                'core.infra.amqpService': mockAmqpService as IAmqpService,
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
                ...depsBase,
                config: conf as IConfig,
                'core.utils.logger': logger as ILogger,
                'core.infra.amqpService': mockAmqpService as IAmqpService,
            });

            const actions = ['action1', 'action2', 'action3'];

            expect(() => events.registerEventActions(actions, 'myplugin', mockCtx)).toThrow();
        });
    });
});
