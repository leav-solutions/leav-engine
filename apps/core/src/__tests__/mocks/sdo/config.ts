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
        clientId: 'testClientId',
        exchange: 'testExchange',
        exchangeType: 'fanout',
        import: {
            enable: true,
            prefetch: 1,
            queue: 'testQueue',
        },
        export: {
            enable: true,
            dataEventsQueue: 'testDataEventsQueue',
        },
        dto: {
            import: {
                enable: true,
                exchange: 'testDtoImportExchange',
                exchangeType: 'fanout',
                queue: 'testDtoImportQueue',
                prefetch: 1,
            },
        },
    },
} as unknown as IConfig;
