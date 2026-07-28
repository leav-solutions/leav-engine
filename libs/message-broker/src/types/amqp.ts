/**
 * Deliberately WITHOUT a `heartbeat` field: amqplib would accept it in `connOpt`, but we don't
 * expose it here so there's only one source of truth (IAmqpConnectionConfig.heartbeatInSeconds)
 * - eliminates by construction the risk of a double setting (and hence amqplib 2.0's `heartbeat: 0` trap).
 */
export interface IAmqpConnectionOptions {
    protocol?: string;
    hostname?: string;
    port?: number;
    username?: string;
    password?: string;
    vhost?: string;
}

export interface IAmqpConnectionConfig {
    connOpt: IAmqpConnectionOptions;
    /** ONLY heartbeat setting (nothing in connOpt). Defaults to 30 in the lib, never implicit 0. */
    heartbeatInSeconds?: number;
    /** Reconnect backoff, defaults to 5 (seconds). */
    reconnectTimeInSeconds?: number;
    /** Human-readable name for logs / RabbitMQ mgmt UI - `config.instanceId` on the caller side. */
    connectionName?: string;
}

export type AmqpConnectionState = 'connecting' | 'connected' | 'disconnected' | 'closed';

/**
 * Structural subset of amqp.ConsumeMessage: the type is narrowed, but the runtime object stays
 * the real amqplib message (no copy), so `msg.content.toString()` etc. still works unchanged.
 */
export interface IAmqpMessage {
    content: Buffer;
    fields: {
        routingKey: string;
        redelivered: boolean;
        deliveryTag: number;
        exchange: string;
        consumerTag: string;
    };
    properties: {
        priority?: number;
        headers?: Record<string, unknown>;
        messageId?: string;
        correlationId?: string;
        replyTo?: string;
    };
}

export type AmqpMessageHandler = (msg: IAmqpMessage) => Promise<void>;

export interface IAmqpTopology {
    assertExchange(exchange: string, type: string, opts?: {durable?: boolean}): Promise<void>;
    assertQueue(
        queue: string,
        opts?: {durable?: boolean; exclusive?: boolean; autoDelete?: boolean; maxPriority?: number},
    ): Promise<void>;
    bindQueue(queue: string, exchange: string, routingKey: string): Promise<void>;
    prefetch(count: number): Promise<void>;
}

export interface ICreateChannelParams {
    /** Channel name for logs / mgmt UI - one per functional usage. */
    name: string;
    /** Replayed automatically on every (re)connect by amqp-connection-manager. */
    setup?: (t: IAmqpTopology) => Promise<void>;
    /**
     * Confirm channel (default true, matches amqp-connection-manager's own default) - only
     * relevant if this channel calls publish(). A pure consumer channel can set this to false:
     * consume()/ack()/nack() behave identically either way.
     */
    confirm?: boolean;
}

export interface IPublishOptions {
    priority?: number;
    persistent?: boolean; // defaults to true (current behavior)
    headers?: Record<string, unknown>;
    correlationId?: string;
    replyTo?: string;
}

export interface IConsumeOptions {
    consumerTag?: string;
    /**
     * false (default): resolve => ack; throw => nack(discard).
     * true: the app calls ack()/nack() itself (used by tasksManager's pause/resume pattern).
     */
    manualAck?: boolean;
    /**
     * Only applies in automatic mode (manualAck: false). Defaults to false = discard without
     * requeue, identical to automation.ts's current behavior.
     */
    requeueOnError?: boolean;
}

export interface IAmqpChannel {
    publish(exchange: string, routingKey: string, content: string | Buffer, opts?: IPublishOptions): Promise<void>;
    /** Returns the consumerTag. Ack/nack contract described by IConsumeOptions.manualAck. */
    consume(queue: string, handler: AmqpMessageHandler, opts?: IConsumeOptions): Promise<string>;
    /** Only valid if the consumer was created with manualAck: true. */
    ack(msg: IAmqpMessage): void;
    nack(msg: IAmqpMessage, requeue?: boolean): void;
    cancel(consumerTag: string): Promise<void>;
    close(): Promise<void>;
    /** Test/ops utility - not part of the app topology contract (never replayed on reconnect). */
    purgeQueue(queue: string): Promise<void>;
    deleteQueue(queue: string): Promise<void>;
}

export interface IAmqpConnection {
    /** One per functional usage - topology and lifecycle isolated from other channels. */
    createChannel(params: ICreateChannelParams): IAmqpChannel;
    /** Snapshot of the resilient connection's state - decouples apps from the AMQP engine (e.g. health check). */
    getConnectionState(): AmqpConnectionState;
    /** Promise.allSettled across all created channels, then the connection itself. */
    close(): Promise<void>;
}
