import { log } from "./../app/log";
import { checkEvent, handleEvent, handleCreate, start } from "../app/watch";

const file = "./test",
  inode = 123456;

jest.mock("../app/redis");

describe("test checkEvent", () => {
  //disable console info in tests
  (start as jest.FunctionLike) = jest.fn();
  console.info = jest.fn();
  console.log = jest.fn();

  it("should call handleCreate when create a file", async () => {
    (log as jest.FunctionLike) = jest.fn();

    await checkEvent("add", file, { ino: inode }, true, 0);

    expect(log).toBeCalledWith(
      undefined,
      expect.stringContaining("create") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()),
    );
  });

  it("should call handleCreate when create a dir", async () => {
    (log as jest.FunctionLike) = jest.fn();

    await checkEvent("addDir", file, { ino: inode }, true, 0);

    expect(log).toBeCalledWith(
      undefined,
      expect.stringContaining("create") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()),
    );
  });

  it("should call handleDelete when delete a file", async () => {
    (log as jest.FunctionLike) = jest.fn();

    await checkEvent("unlink", file, { ino: inode }, true, 0);

    expect(log).toBeCalledWith(
      undefined,
      expect.stringContaining("delete") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()),
    );
  });

  it("should call handleDelete when delete a dir", async () => {
    (log as jest.FunctionLike) = jest.fn();

    await checkEvent("unlinkDir", file, { ino: inode }, true, 0);

    expect(log).toBeCalledWith(
      undefined,
      expect.stringContaining("delete") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()),
    );
  });

  it("should call handleUpdate when update a file's content", async () => {
    (log as jest.FunctionLike) = jest.fn();

    await checkEvent("change", file, { ino: inode }, true, 0);

    expect(log).toBeCalledWith(
      undefined,
      expect.stringContaining("update") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()),
    );
  });

  it("should call handleMove when move a file", async () => {
    (log as jest.FunctionLike) = jest.fn();

    await checkEvent("unlink", file, { ino: inode }, true, 500);
    await checkEvent("add", file + 1, { ino: inode }, true, 500);

    expect(log).toBeCalledWith(
      undefined,
      expect.stringContaining("move") &&
        expect.stringContaining(file) &&
        expect.stringContaining(inode.toString()),
    );
  });
});
