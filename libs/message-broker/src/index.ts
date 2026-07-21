// export {initAmqp} from './amqp';
export {default as amqpService} from './amqpService';
export type {IAmqpService} from './amqpService';

export {createAmqpConnection} from './amqpConnection';
export type {
    AmqpConnectionState,
    AmqpMessageHandler,
    IAmqpChannel,
    IAmqpConnection,
    IAmqpConnectionConfig,
    IAmqpConnectionOptions,
    IAmqpMessage,
    IAmqpTopology,
    IConsumeOptions,
    IPublishOptions,
} from './types/amqp';
