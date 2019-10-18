import { start } from "../app/watch";
import redis from "redis";

const client = redis.createClient();

describe("check if redis work", () => {
  const now = Date.now().toString();

  it("should set data test", async () => {
    expect(client.set("test", now)).toBeFalsy();
  });

  it("should get data test", async () => {
    const res = await new Promise(resolve =>
      client.get("test", (err, data) => {
        resolve(data);
      })
    );
    expect(res).toEqual(now);
  });
});


describe("check if watcher work", () => {
  const folder_to_watch = "folder_to_watch";
  const watcher = start(`./${folder_to_watch}`, undefined, false);
  it("should show the watched files", async () => {
    watcher.on("ready", () => {
      watcher.getWatched = jest.fn();
      const files_watched = watcher.getWatched();
      expect(JSON.stringify(files_watched)).toMatch(/folder_to_watch/);
    });
  });
  watcher.close();
});
