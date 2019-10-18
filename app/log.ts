import { Channel } from "amqplib";
import { config } from "./index";

export const log = (channel: Channel | undefined, msg: string) => {
  const queue = config && config.amqp && config.amqp.queue;

  if (channel && queue) {
    // if we had channel, send message to rabbitmq
    channel.assertQueue(queue, {
      durable: false,
    });

    channel.sendToQueue(queue, Buffer.from(msg));
  } else {
    // else just console.log the infos
    console.info(msg);
  }
};
