import { initRedis } from "../redis/redis";
import { sendToRabbitMQ } from "../rabbitmq/rabbitmq";
import { checkEvent } from "./watch";

const file = "./test",
  inode = 123456,
  rootKey = "rootKey",
  stats = { ino: inode };

jest.mock("../index");
jest.mock("../redis/redis");

describe("test checkEvent", () => {
  //disable console info in tests
  console.info = jest.fn();

  test("Init - add a file", async () => {
    (initRedis as jest.FunctionLike) = jest.fn();
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    const params = {
      verbose: false,
      ready: false,
      timeout: 0,
      rootKey,
    };

    await checkEvent("add", file, stats, params);

    expect(initRedis).toBeCalledWith(file, inode);
    expect(sendToRabbitMQ).not.toBeCalled();
  });

  test("Init - add a folder", async () => {
    (initRedis as jest.FunctionLike) = jest.fn();
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    const params = {
      verbose: false,
      ready: false,
      timeout: 0,
      rootKey,
    };

    await checkEvent("addDir", file, stats, params);

    expect(initRedis).toBeCalledWith(file, inode);
    expect(sendToRabbitMQ).not.toBeCalled();
  });

  test("Add a file", async () => {
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    const params = {
      verbose: false,
      ready: true,
      timeout: 0,
      rootKey,
    };

    await checkEvent("add", file, stats, params);

    expect(sendToRabbitMQ).toBeCalledWith(
      expect.stringContaining("create") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()) &&
        expect.stringContaining(rootKey),
      {},
    );
  });

  test("Add a dir", async () => {
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    const params = {
      verbose: false,
      ready: true,
      timeout: 0,
      rootKey,
    };

    await checkEvent("addDir", file, stats, params);

    expect(sendToRabbitMQ).toBeCalledWith(
      expect.stringContaining("create") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()) &&
        expect.stringContaining(rootKey),
      {},
    );
  });

  test("Unlink a file", async () => {
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    const params = {
      verbose: false,
      ready: true,
      timeout: 0,
      rootKey,
    };

    await checkEvent("unlink", file, stats, params);

    expect(sendToRabbitMQ).toBeCalledWith(
      expect.stringContaining("delete") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()) &&
        expect.stringContaining(rootKey),
      {},
    );
  });

  test("Unlink a dir", async () => {
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    const params = {
      verbose: false,
      ready: true,
      timeout: 0,
      rootKey,
    };

    await checkEvent("unlinkDir", file, stats, params);

    expect(sendToRabbitMQ).toBeCalledWith(
      expect.stringContaining("delete") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()) &&
        expect.stringContaining(rootKey),
      {},
    );
  });

  test("Update a file", async () => {
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    const params = {
      verbose: false,
      ready: true,
      timeout: 0,
      rootKey,
    };

    await checkEvent("change", file, stats, params);

    expect(sendToRabbitMQ).toBeCalledWith(
      expect.stringContaining("update") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()) &&
        expect.stringContaining(rootKey),
      {},
    );
  });

  test("Move a file", async () => {
    (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

    const params = {
      verbose: false,
      ready: true,
      timeout: 500,
      rootKey,
    };

    await checkEvent("unlink", file, stats, params);
    await checkEvent("add", file + 1, stats, params);

    expect(sendToRabbitMQ).toBeCalledWith(
      expect.stringContaining("move") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()) &&
        expect.stringContaining(rootKey),
      {},
    );
  });
});
