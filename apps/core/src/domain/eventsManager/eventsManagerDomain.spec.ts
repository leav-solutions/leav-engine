import {type AmqpMessageHandler} from '@leav/message-broker';
import {EventAction} from '@leav/utils';
import {type IUtils, type ToAny} from '../../utils/utils';
import {type IConfig} from '../../_types/config';
import {type IQueryInfos} from '../../_types/queryInfos';
import {mockCtx} from '../../__tests__/mocks/shared';
import eventsManager, {type IEventsManagerDomainDeps} from './eventsManagerDomain';
import {type IEventsManagerRabbitMQ} from '../../infra/eventsManager/eventsManagerRabbitMQ';
import {type ILogger} from '@leav/logger';

const debugLog = false;
const logger: Mockify<ILogger> = {
    error: vi.fn((...args) => debugLog && console.log(args)),
    warn: vi.fn((...args) => debugLog && console.log(args)),
};

const ctx: IQueryInfos = {
    userId: '1',
    queryId: 'eventsManagerDomainTest',
};

let capturedPubSubHandler: AmqpMessageHandler | undefined;

const mockEventsManagerRabbitMQ: Mockify<IEventsManagerRabbitMQ> = {
    publishDatabaseEvent: global.__mockPromise(),
    publishPubSubEvent: global.__mockPromise(),
    consumePubSubEvents: vi.fn().mockImplementation(handler => {
        capturedPubSubHandler = handler;
        return Promise.resolve();
    }),
    close: vi.fn(),
};

const depsBase: ToAny<IEventsManagerDomainDeps> = {
    config: {},
    'core.infra.eventsManager.rabbitMQ': mockEventsManagerRabbitMQ,
    'core.utils.logger': vi.fn(),
    'core.utils': vi.fn(),
};

const fakeMsg = (content: string): any => ({content: Buffer.from(content), fields: {}, properties: {}});

describe('Events Manager', () => {
    afterEach(() => {
        vi.clearAllMocks();
        capturedPubSubHandler = undefined;
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

    const mockUtils: Mockify<IUtils> = {
        getProcessIdentifier: vi.fn().mockReturnValue('98765431-42'),
    };

    test('Init', async () => {
        const events = eventsManager({
            ...depsBase,
            config: conf as IConfig,
            'core.utils.logger': logger as ILogger,
        });

        await events.initPubSubEventsConsumer();

        expect(mockEventsManagerRabbitMQ.consumePubSubEvents).toBeCalledTimes(1);
    });

    test('send database event', async () => {
        const events = eventsManager({
            ...depsBase,
            config: conf as IConfig,
            'core.utils': mockUtils as IUtils,
        });

        await events.sendDatabaseEvent<EventAction.LIBRARY_SAVE>(
            {action: EventAction.LIBRARY_SAVE, topic: {library: 'test'}, after: {id: 'test'}},
            ctx,
        );

        expect(mockEventsManagerRabbitMQ.publishDatabaseEvent).toBeCalledTimes(1);
    });

    test('send pubsub event', async () => {
        const events = eventsManager({
            ...depsBase,
            config: conf as IConfig,
            'core.utils': mockUtils as IUtils,
        });

        await events.sendPubSubEvent({triggerName: 'test', data: {}}, ctx);

        expect(mockEventsManagerRabbitMQ.publishPubSubEvent).toBeCalledTimes(1);
    });

    describe('pubsub message handler', () => {
        test('resolves for a valid message', async () => {
            const events = eventsManager({
                ...depsBase,
                config: conf as IConfig,
                'core.utils.logger': logger as ILogger,
            });

            await events.initPubSubEventsConsumer();

            const validMsg = fakeMsg(
                JSON.stringify({
                    instanceId: 'test_instance',
                    time: Date.now(),
                    userId: 'test_user',
                    emitter: 'test_emitter',
                    payload: {triggerName: 'test_trigger', data: {foo: 'bar'}},
                }),
            );

            await expect(capturedPubSubHandler!(validMsg)).resolves.toBeUndefined();
        });

        test('still resolves for a schema-invalid message (logged only, not rejected)', async () => {
            const events = eventsManager({
                ...depsBase,
                config: conf as IConfig,
                'core.utils.logger': logger as ILogger,
            });

            await events.initPubSubEventsConsumer();

            // Missing required fields (instanceId, emitter) - fails Joi validation, but payload.data
            // is still present, so processing continues and publishes anyway (unchanged behavior).
            const schemaInvalidMsg = fakeMsg(
                JSON.stringify({
                    time: Date.now(),
                    userId: 'test_user',
                    payload: {triggerName: 'test_trigger', data: {}},
                }),
            );

            await expect(capturedPubSubHandler!(schemaInvalidMsg)).resolves.toBeUndefined();
            expect(logger.error).toBeCalled();
        });

        test('rejects for an unparseable message (new automatic nack contract)', async () => {
            const events = eventsManager({
                ...depsBase,
                config: conf as IConfig,
                'core.utils.logger': logger as ILogger,
            });

            await events.initPubSubEventsConsumer();

            const unparseableMsg = fakeMsg('not json');

            await expect(capturedPubSubHandler!(unparseableMsg)).rejects.toThrow();
        });
    });

    describe('registerEventActions', () => {
        test('registerEventActions', () => {
            const events = eventsManager({
                ...depsBase,
                config: conf as IConfig,
                'core.utils.logger': logger as ILogger,
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
            });

            const actions = ['action1', 'action2', 'action3'];

            expect(() => events.registerEventActions(actions, 'myplugin', mockCtx)).toThrow();
        });
    });
});
