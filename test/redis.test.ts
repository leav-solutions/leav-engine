import {
  initRedis,
  getClient,
  updateData,
  deleteData,
  getInode,
} from "./../app/redis";

let path = `./test-${Math.floor(Math.random() * Math.floor(10000000))}`,
  inode = 1234;

describe("test redis functions", () => {
  const client = getClient();

  test("client", () => {
    expect(client.randomkey()).not.toBeNull();
  });

  test("initRedis", async () => {
    expect(await client.get(path)).toBeNull();
    await initRedis(path, inode);
    expect(await client.get(path)).toEqual(inode.toString());
  });

  test("updateData without oldPath", async () => {
    expect(await client.get(path)).toEqual(inode.toString());

    inode++;

    await updateData(path, inode);
    expect(await client.get(path)).toEqual(inode.toString());
  });

  const newPath = path + 1;
  test("updateData with oldPath", async () => {
    expect(await client.get(path)).toEqual(inode.toString());
    inode--;
    await updateData(newPath, inode, path);
    expect(await client.get(newPath)).toEqual(inode.toString());
  });

  test("deleteData", async () => {
    expect(await client.get(newPath)).not.toBeNull();
    await deleteData(newPath);
    expect(await client.get(newPath)).toBeNull();
  });

  test("getInode", async () => {
    await client.set(path, inode.toString());
    expect(await getInode(path)).toEqual(inode);
  });

  //Clear redis
  client.del(path);
});
