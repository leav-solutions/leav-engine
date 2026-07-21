import {type IAmqpTopology} from '@leav/message-broker';
import {type IConfig} from '../../_types/config';

export interface ICoreExchangeRabbitMQ {
    /**
     * Asserts config.amqp.exchange onto the given channel's topology. Idempotent, safe to call
     * from every channel's own setup - assertExchange is a per-channel AMQP operation, so each
     * channel must declare it on its own raw channel even though it's conceptually the same exchange.
     */
    assertOnto(topology: IAmqpTopology): Promise<void>;
}

interface IDeps {
    config: IConfig;
}

export default function ({config}: IDeps): ICoreExchangeRabbitMQ {
    return {
        assertOnto: topology => topology.assertExchange(config.amqp.exchange, config.amqp.type),
    };
}
