import { initRedis, updateData, deleteData, getInode } from "../app/redis";
import { Tedis } from "redis-typescript";

let path = "./test",
  inode = 1234;

jest.mock("redis-typescript");

describe("test redis functions", () => {
  test("initRedis", async () => {
    const spy = jest.spyOn(Tedis.prototype, "set");

    await initRedis(path, inode);

    expect(spy).toBeCalled();
  });

  test("updateData without oldPath", async () => {
    const spySet = jest.spyOn(Tedis.prototype, "set");
    const spyDel = jest.spyOn(Tedis.prototype, "del");

    await updateData(path, inode);

    expect(spySet).toBeCalled();
    expect(spyDel).not.toBeCalled();
  });

  test("updateData with oldPath", async () => {
    const spySet = jest.spyOn(Tedis.prototype, "set");
    const spyDel = jest.spyOn(Tedis.prototype, "del");

    await updateData(path, inode, path + 1);

    expect(spySet).toBeCalled();
    expect(spyDel).toBeCalled();
  });

  test("deleteData", async () => {
    const spyDel = jest.spyOn(Tedis.prototype, "del");

    await deleteData(path);

    expect(spyDel).toBeCalled();
  });

  test("getInode", async () => {
    const spyGet = jest.spyOn(Tedis.prototype, "set");
    console.error = jest.fn(); // Cancel console.error

    await getInode(path); // Will trigger an console.error

    expect(spyGet).toBeCalled();
  });
});
