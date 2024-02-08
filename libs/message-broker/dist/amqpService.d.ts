import * as amqp from 'amqplib';
import {IAmqp, onMessageFunc} from './types/amqp';
export interface IAmqpService {
    publisher: {
        connection: amqp.Connection;
        channel: amqp.ConfirmChannel;
    };
    consumer: {
        connection: amqp.Connection;
        channel: amqp.ConfirmChannel;
    };
    publish(exchange: string, routingKey: string, msg: string, priority?: number): Promise<boolean>;
    consume(queue: string, routingKey: string, onMessage: onMessageFunc, consumerTag?: string): Promise<amqp.Replies.Consume>;
    close(): Promise<void>;
}
interface IDeps {
    config: IAmqp;
}
export default function ({ config }: IDeps): Promise<IAmqpService>;
export {};
