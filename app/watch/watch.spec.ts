import { initRedis } from "../redis/redis";
import { log } from "../log/log";
import { checkEvent } from "./watch";

const file = "./test",
  inode = 123456;

jest.mock("../index");
jest.mock("../redis/redis");

describe("test checkEvent", () => {
  //disable console info in tests
  console.info = jest.fn();
  console.log = jest.fn();

  test("Add a file before watcher is ready", async () => {
    (initRedis as jest.FunctionLike) = jest.fn();

    await checkEvent("add", file, { ino: inode }, false, 0, {});

    expect(initRedis).toBeCalledWith(file, inode);
  });

  test("Add a folder before watcher is ready", async () => {
    (initRedis as jest.FunctionLike) = jest.fn();

    await checkEvent("addDir", file, { ino: inode }, false, 0, {});

    expect(initRedis).toBeCalledWith(file, inode);
  });

  test("Add a file", async () => {
    (log as jest.FunctionLike) = jest.fn();

    await checkEvent("add", file, { ino: inode }, true, 0, {});

    expect(log).toBeCalledWith(
      expect.stringContaining("create") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()),
      undefined,
      undefined,
    );
  });

  test("Add a dir", async () => {
    (log as jest.FunctionLike) = jest.fn();

    await checkEvent("addDir", file, { ino: inode }, true, 0, {});

    expect(log).toBeCalledWith(
      expect.stringContaining("create") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()),
      undefined,
      undefined,
    );
  });

  test("Unlink a file", async () => {
    (log as jest.FunctionLike) = jest.fn();

    await checkEvent("unlink", file, { ino: inode }, true, 0, {});

    expect(log).toBeCalledWith(
      expect.stringContaining("delete") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()),
      undefined,
      undefined,
    );
  });

  test("Unlink a dir", async () => {
    (log as jest.FunctionLike) = jest.fn();

    await checkEvent("unlinkDir", file, { ino: inode }, true, 0, {});

    expect(log).toBeCalledWith(
      expect.stringContaining("delete") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()),
      undefined,
      undefined,
    );
  });

  test("Update a file", async () => {
    (log as jest.FunctionLike) = jest.fn();

    await checkEvent("change", file, { ino: inode }, true, 0, {});

    expect(log).toBeCalledWith(
      expect.stringContaining("update") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()),
      undefined,
      undefined,
    );
  });

  test("Move a file", async () => {
    (log as jest.FunctionLike) = jest.fn();

    await checkEvent("unlink", file, { ino: inode }, true, 500, {});
    await checkEvent("add", file + 1, { ino: inode }, true, 500, {});

    expect(log).toBeCalledWith(
      expect.stringContaining("move") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()),
      undefined,
      undefined,
    );
  });
});
