import { log } from "../app/log";

describe("test log", () => {
  it("check if display msg", () => {
    console.info = jest.fn();
    log(
      undefined,
      JSON.stringify({
        event: "create",
        time: Date.now(),
        pathAfter: "path",
        pathBefore: null,
        inode: "inode",
        rootKey: "config.rootKey",
      }),
    );
    expect(console.info).toHaveBeenCalledTimes(1);
  });
});
