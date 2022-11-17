import { IAmqp, onMessageFunc } from './_types/amqp';
import * as amqp from 'amqplib';
export interface IAmqpService {
    publisher: {
        connection: amqp.Connection;
        channel: amqp.ConfirmChannel;
    };
    consumer: {
        connection: amqp.Connection;
        channel: amqp.ConfirmChannel;
    };
    publish(exchange: string, routingKey: string, msg: string): Promise<void>;
    consume(queue: string, routingKey: string, onMessage: onMessageFunc): Promise<void>;
    close(): Promise<void>;
}
interface IDeps {
    config: IAmqp;
}
export default function ({ config }: IDeps): Promise<IAmqpService>;
export {};
