import * as watch from "./../app/watch";

const file = "./test",
  inode = 123456;

describe("test handleEvent", () => {
  //disable console info in tests
  console.info = jest.fn();

  it("should call handleCreate when create a file", async () => {
    const spy = jest.spyOn(watch, "handleCreate");

    watch.handleEvent("add", file, inode);

    expect(spy).toBeCalled();
  });

  it("should call handleCreate when create a dir", async () => {
    const spy = jest.spyOn(watch, "handleCreate");

    watch.handleEvent("addDir", file, inode);

    expect(spy).toBeCalled();
  });

  it("should call handleDelete when delete a file", async () => {
    const spy = jest.spyOn(watch, "handleDelete");

    watch.handleEvent("unlink", file, inode);

    expect(spy).toBeCalled();
  });

  it("should call handleDelete when delete a dir", async () => {
    const spy = jest.spyOn(watch, "handleDelete");

    watch.handleEvent("unlinkDir", file, inode);

    expect(spy).toBeCalled();
  });

  it("should call handleUpdate when update a file's content", async () => {
    const spy = jest.spyOn(watch, "handleUpdate");

    watch.handleEvent("change", file, inode);

    expect(spy).toBeCalled();
  });

  it("should call handleMove when move a file", async () => {
    const spy = jest.spyOn(watch, "handleMove");

    await watch.handleEvent("move", file + "1", inode, file);

    expect(spy).toBeCalled();
  });
});
