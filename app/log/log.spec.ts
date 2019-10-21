import { Options } from "amqplib";
import { log } from "./log";

jest.mock("../index");

describe("test log", () => {
  test("check if display msg", () => {
    console.info = jest.fn();
    log(
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
      assertQueue: jest.fn(
        (queue: string, options?: Options.AssertQueue) => {},
      ),
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

    const queue = "log";

    log(msg, channelMock, queue);

    expect(channelMock.assertQueue).toBeCalledWith(queue, { durable: false });
    expect(channelMock.sendToQueue).toBeCalledWith(queue, Buffer.from(msg));
  });
});
