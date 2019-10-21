import chokidar from "chokidar";
import { Channel } from "amqplib";
import { initRedis, updateData, deleteData, getInode } from "../redis/redis";
import { log } from "../log/log";
import { config } from "../index";

interface AmqpParams {
  channel?: Channel;
  queue?: string;
}

const inodes: { [i: number]: string } = {};
const timers: { [i: number]: any } = {};

const inits: { path: string; inode: number }[] = [];

let verbose = false;

export const start = (
  rootPathProps: string,
  verboseProps = false,
  amqpParams: AmqpParams,
  timeout = 2500,
) => {
  let ready = false;
  const watcherConfig =
    (config && config.watcher && config.watcher.awaitWriteFinish) || false;

  verbose = verboseProps;

  const channel = amqpParams.channel;
  const queue = amqpParams.queue;
  const watcher = chokidar.watch(rootPathProps, {
    ignored: /(^|[\/\\])\../, //ignore dot file
    ignoreInitial: false, //use init for redis
    alwaysStat: true, //always give stats for add and update event
    cwd: ".", //start path
    awaitWriteFinish: watcherConfig, //wait for copy to finish before trigger event
  });

  watcher.on("all", (event: string, path: string, stats: any) => {
    checkEvent(event, path, stats, ready, timeout, { channel, queue });
  });

  watcher.on("ready", () => {
    ready = true;
  });

  return watcher;
};

export const checkEvent = async (
  event: string,
  path: string,
  stats: any,
  ready: boolean,
  timeout: number,
  amqpParams: AmqpParams,
) => {
  let inode: number;

  if (stats) {
    inode = stats.ino;
  } else {
    inode = await getInode(path);
  }

  if (!ready) {
    handleInit(path, inode);
    return;
  }

  if (inodes[inode] && path !== inodes[inode]) {
    handleEvent(amqpParams, "move", path, inode, inodes[inode]);
  } else {
    inodes[inode] = path;
    await delayHandleEvent(event, path, inode, timeout, amqpParams);
  }
};

const delayHandleEvent = async (
  event: string,
  path: string,
  inode: number,
  timeout: number,
  amqpParams: AmqpParams,
) => {
  return new Promise(
    r =>
      (timers[inode] = setTimeout(
        () => r(handleEvent(amqpParams, event, path, inode)),
        timeout,
      )),
  );
};

export const handleEvent = async (
  amqpParams: AmqpParams,
  event: string,
  path: string,
  inode: number,
  oldPath?: string,
) => {
  switch (event) {
    case "add":
    case "addDir":
      await handleCreate(path, inode, amqpParams);
      break;
    case "unlink":
    case "unlinkDir":
      await handleDelete(path, inode, amqpParams);
      break;
    case "change":
      await handleUpdate(path, inode, amqpParams);
      break;
    case "move":
      if (oldPath) {
        await handleMove(oldPath, path, inode, amqpParams);
      }
      break;
    default:
      console.error("event not manage : " + event);
      break;
  }

  clearTimeout(timers[inode]);
  delete timers[inode];
  delete inodes[inode];
};

export const handleCreate = async (
  path: string,
  inode: number,
  amqpParams: AmqpParams,
) => {
  await updateData(path, inode);
  log(
    JSON.stringify({
      event: "create",
      time: Date.now(),
      pathAfter: path,
      pathBefore: null,
      inode: inode,
      rootKey: config.rootKey,
    }),
    amqpParams.channel,
    amqpParams.queue,
  );
  if (verbose) {
    console.info("create", path);
  }
};

export const handleDelete = async (
  path: string,
  inode: number,
  amqpParams: AmqpParams,
) => {
  await deleteData(path);
  log(
    JSON.stringify({
      event: "delete",
      time: Date.now(),
      pathAfter: null,
      pathBefore: path,
      inode: inode,
      rootKey: config.rootKey,
    }),
    amqpParams.channel,
    amqpParams.queue,
  );
  if (verbose) {
    console.info("delete", path);
  }
};

export const handleUpdate = async (
  path: string,
  inode: number,
  amqpParams: AmqpParams,
) => {
  await updateData(path, inode);
  log(
    JSON.stringify({
      event: "update",
      time: Date.now(),
      pathAfter: path,
      pathBefore: null,
      inode: inode,
      rootKey: config.rootKey,
    }),
    amqpParams.channel,
    amqpParams.queue,
  );
  if (verbose) {
    console.info("update", path);
  }
};

export const handleMove = async (
  pathBefore: string,
  pathAfter: string,
  inode: number,
  amqpParams: AmqpParams,
) => {
  await updateData(pathAfter, inode, pathBefore);
  log(
    JSON.stringify({
      event: "move",
      time: Date.now(),
      pathAfter: pathAfter,
      pathBefore: pathBefore,
      inode: inode,
      rootKey: config.rootKey,
    }),
    amqpParams.channel,
    amqpParams.queue,
  );
  if (verbose) {
    console.info("move", pathBefore, pathAfter);
  }
};

let working = false;
const handleInit = async (path: string, inode: number) => {
  inits.push({ path, inode });
  manageRedisInit();
};

export const manageRedisInit = async () => {
  if (!working) {
    working = true;
    while (inits.length > 0) {
      const init = inits.shift();
      if (init) {
        await initRedis(init.path, init.inode);
        if (verbose) {
          console.info("init", init.path);
        }
      }
    }
    working = false;
  }
};
