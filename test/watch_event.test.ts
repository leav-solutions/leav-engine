import {
  handleCreate,
  handleDelete,
  handleUpdate,
  handleMove
} from "../app/watch";

const file = "./test",
  inode = 123456;

describe("test create event", () => {
  it("should add a file", async () => {
    console.info = jest.fn();

    await handleCreate(file, inode);

    expect(console.info).toBeCalledTimes(1);
  });
});

describe("test delete event", () => {
  it("should remove a file", async () => {
    console.info = jest.fn();

    await handleDelete(file, inode);

    expect(console.info).toBeCalledTimes(1);
  });
});

describe("test update event", () => {
  it("should update a file", async () => {
    console.info = jest.fn();

    await handleUpdate(file, inode);

    expect(console.info).toBeCalledTimes(1);
  });
});

describe("test move event", () => {
  it("should move a file", async () => {
    console.info = jest.fn();

    await handleMove(file, "./test1", inode);

    expect(console.info).toBeCalledTimes(1);
  });
});
