import { Options } from "amqplib";
import { sendToRabbitMQ } from "./rabbitmq";

jest.mock("../index");

describe("test sendToRabbitMQ", () => {
  test("check if display msg", () => {
    console.info = jest.fn();
    sendToRabbitMQ(
      JSON.stringify({
        event: "create",
        time: Date.now(),
        pathAfter: "path",
        pathBefore: null,
        inode: "inode",
        rootKey: "config.rootKey",
      }),
      undefined,
    );
    expect(console.info).toHaveBeenCalledTimes(1);
  });

  test("check if send to rabbitmq", () => {
    const channelMock: any = {
      sendToQueue: jest.fn((queue: string, content: Buffer) => {}),
    };

    const msg = JSON.stringify({
      event: "create",
      time: Date.now(),
      pathAfter: "path",
      pathBefore: null,
      inode: "inode",
      rootKey: "config.rootKey",
    });

    const queue = "sendToRabbitMQ";

    sendToRabbitMQ(msg, channelMock, queue);

    expect(channelMock.sendToQueue).toBeCalledWith(queue, Buffer.from(msg));
  });
});
