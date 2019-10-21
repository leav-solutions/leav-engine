import { Tedis } from "redis-typescript";

const client = new Tedis({
  port: 6379,
  host: "127.0.0.1",
});

client.on("connect", () => {});

client.on("error", err => {
  console.log(err);
});

export const initRedis = (path: string, inode: number) => {
  return client.set(path, inode.toString());
};

export const updateData = async (
  path: string,
  inode: number,
  oldPath?: string,
) => {
  if (oldPath) {
    client.del(oldPath);
  }

  return client.set(path, inode.toString());
};

export const deleteData = (path: string) => {
  return client.del(path);
};

export const getInode = async (path: string) => {
  const value = await client.get(path);
  if (value) {
    return parseInt(value.toString());
  } else {
    console.error(path + " not found in redis");
    return 0;
  }
};
