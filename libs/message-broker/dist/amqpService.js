"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const amqp = __importStar(require("amqplib"));
async function default_1({ config }) {
    let publisher;
    let consumer;
    let retries = 0;
    const _init = async () => {
        const publisherConnection = await amqp.connect(config.connOpt);
        const publisherChannel = await publisherConnection.createConfirmChannel();
        await publisherChannel.assertExchange(config.exchange, config.type);
        await publisherChannel.prefetch(config.prefetch);
        const consumerConnection = await amqp.connect(config.connOpt);
        const consumerChannel = await consumerConnection.createConfirmChannel();
        await consumerChannel.assertExchange(config.exchange, config.type);
        await consumerChannel.prefetch(config.prefetch);
        publisher = { connection: publisherConnection, channel: publisherChannel };
        consumer = { connection: consumerConnection, channel: consumerChannel };
    };
    await _init();
    const publish = async (exchange, routingKey, msg, priority) => {
        try {
            console.log('publish', { exchange, routingKey, msg, priority });
            await publisher.channel.checkExchange(exchange);
            publisher.channel.publish(exchange, routingKey, Buffer.from(msg), { persistent: true, priority });
            await publisher.channel.waitForConfirms();
            retries = 0;
        }
        catch (e) {
            if (!retries) {
                retries += 1;
                try {
                    await _init();
                    await publish(exchange, routingKey, msg, priority);
                }
                catch (err) {
                    throw new Error('2 tries reached. Stop sync.');
                }
            }
            else {
                throw new Error('2 tries reached. Stop sync.');
            }
        }
    };
    const consume = async (queue, routingKey, onMessage, consumerTag) => {
        return consumer.channel.consume(queue, async (msg) => {
            if (!msg) {
                return;
            }
            try {
                await onMessage(msg);
            }
            catch (e) {
                console.error(process.pid, 'err amqp', e);
                console.error(`[${queue}/${routingKey}] Error while processing message:
                        ${e}.
                        Message was: ${msg.content.toString()}
                    `);
            }
            finally {
                // TODO: add ack if msg has not been acked
            }
        }, { consumerTag });
    };
    const close = async () => {
        await publisher.channel.close();
        await publisher.connection.close();
        await consumer.channel.close();
        await consumer.connection.close();
    };
    return {
        publisher,
        consumer,
        publish,
        consume,
        close
    };
}
exports.default = default_1;
//# sourceMappingURL=amqpService.js.map