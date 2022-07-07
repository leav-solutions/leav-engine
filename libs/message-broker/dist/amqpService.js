"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const amqp = __importStar(require("amqplib"));
async function default_1({ config }) {
    let publisher;
    let consumer;
    let retries = 0;
    const init = async () => {
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
    await init();
    const publish = async (exchange, routingKey, msg) => {
        try {
            await publisher.channel.checkExchange(exchange);
            publisher.channel.publish(exchange, routingKey, Buffer.from(msg), { persistent: true });
            await publisher.channel.waitForConfirms();
            retries = 0;
        }
        catch (e) {
            if (!retries) {
                retries += 1;
                try {
                    await init();
                    await publish(exchange, routingKey, msg);
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
    const consume = async (queue, routingKey, onMessage) => {
        await consumer.channel.consume(queue, async (msg) => {
            if (!msg) {
                return;
            }
            const msgString = msg.content.toString();
            try {
                await onMessage(msgString);
            }
            catch (e) {
                console.error(`[${queue}/${routingKey}] Error while processing message:
                        ${e}.
                        Message was: ${msgString}
                    `);
            }
            finally {
                consumer.channel.ack(msg);
            }
        });
    };
    const close = async () => {
        await publisher.connection.close();
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