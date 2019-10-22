import { initRedis } from "../redis/redis";
import { sendToRabbitMQ } from "../rabbitmq/rabbitmq";
import { checkEvent } from "./watch";

const file = "./test",
  inode = 123456,
  rootKey = "rootKey";

jest.mock("../index");
jest.mock("../redis/redis");

describe("test checkEvent", () => {
  //disable console info in tests
  console.info = jest.fn();

  test("Init - add a file", async () => {
    (initRedis as jest.FunctionLike) = jest.fn();
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    await checkEvent("add", file, { ino: inode }, false, 0, rootKey, {});

    expect(initRedis).toBeCalledWith(file, inode);
    expect(sendToRabbitMQ).not.toBeCalled();
  });

  test("Init - add a folder", async () => {
    (initRedis as jest.FunctionLike) = jest.fn();
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    await checkEvent("addDir", file, { ino: inode }, false, 0, rootKey, {});

    expect(initRedis).toBeCalledWith(file, inode);
    expect(sendToRabbitMQ).not.toBeCalled();
  });

  test("Add a file", async () => {
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    await checkEvent("add", file, { ino: inode }, true, 0, rootKey, {});

    expect(sendToRabbitMQ).toBeCalledWith(
      expect.stringContaining("create") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()) &&
        expect.stringContaining(rootKey),
      undefined,
      undefined,
    );
  });

  test("Add a dir", async () => {
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    await checkEvent("addDir", file, { ino: inode }, true, 0, rootKey, {});

    expect(sendToRabbitMQ).toBeCalledWith(
      expect.stringContaining("create") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()) &&
        expect.stringContaining(rootKey),
      undefined,
      undefined,
    );
  });

  test("Unlink a file", async () => {
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    await checkEvent("unlink", file, { ino: inode }, true, 0, rootKey, {});

    expect(sendToRabbitMQ).toBeCalledWith(
      expect.stringContaining("delete") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()) &&
        expect.stringContaining(rootKey),
      undefined,
      undefined,
    );
  });

  test("Unlink a dir", async () => {
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    await checkEvent("unlinkDir", file, { ino: inode }, true, 0, rootKey, {});

    expect(sendToRabbitMQ).toBeCalledWith(
      expect.stringContaining("delete") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()) &&
        expect.stringContaining(rootKey),
      undefined,
      undefined,
    );
  });

  test("Update a file", async () => {
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    await checkEvent("change", file, { ino: inode }, true, 0, rootKey, {});

    expect(sendToRabbitMQ).toBeCalledWith(
      expect.stringContaining("update") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()) &&
        expect.stringContaining(rootKey),
      undefined,
      undefined,
    );
  });

  test("Move a file", async () => {
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    await checkEvent("unlink", file, { ino: inode }, true, 500, rootKey, {});
    await checkEvent("add", file + 1, { ino: inode }, true, 500, rootKey, {});

    expect(sendToRabbitMQ).toBeCalledWith(
      expect.stringContaining("move") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()) &&
        expect.stringContaining(rootKey),
      undefined,
      undefined,
    );
  });
});
