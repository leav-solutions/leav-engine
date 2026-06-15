import {type IConfig} from '../../../_types/config';

export const mockConfig = {
    amqp: {
        exchange: 'test_leav_core',
    },
    eventsManager: {
        routingKeys: {
            data_events: 'test_data.events',
        },
    },
    sdo: {
        import: {
            enable: true,
            prefetch: 1,
            queue: 'testQueue',
        },
        export: {
            enable: true,
            exchange: 'testExchange',
            type: 'fanout',
            dataEventsQueue: 'testDataEventsQueue',
        },
    },
} as unknown as IConfig;
