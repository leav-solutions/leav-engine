import { sendToRabbitMQ, generateMsgRabbitMQ } from "./rabbitmq";

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
      publish: jest.fn(
        (
          exchange: string,
          routingKey: string,
          content: Buffer,
          options?: any,
        ) => {},
      ),
    };

    const msg = JSON.stringify({
      event: "create",
      time: Date.now(),
      pathAfter: "path",
      pathBefore: null,
      inode: "inode",
      rootKey: "config.rootKey",
    });

    const exchange = "sendToRabbitMQ",
      routingKey = "12345abc";

    sendToRabbitMQ(msg, {
      channel: channelMock,
      exchange: exchange,
      routingKey: routingKey,
    });

    expect(channelMock.publish).toBeCalledWith(
      exchange,
      routingKey,
      Buffer.from(msg),
      expect.anything(),
    );
  });
});

describe("test generateMsgRabbitMQ", () => {
  test("check render generateMsgRabbitMQ", () => {
    const event = "create",
      pathBefore = "./file",
      pathAfter = "./test",
      inode = 12344,
      rootKey = "abc1244";

    const res = generateMsgRabbitMQ(
      event,
      pathBefore,
      pathAfter,
      inode,
      rootKey,
    );

    expect(res).toEqual(
      JSON.stringify({
        event,
        time: Math.round(Date.now() / 1000),
        pathAfter,
        pathBefore,
        inode,
        rootKey,
      }),
    );
  });
});
