import { Channel } from "amqplib";

export const log = (msg: string, channel?: Channel, queue?: string) => {
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
