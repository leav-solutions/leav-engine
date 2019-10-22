import { ParamsHandleEvent } from "./../types";
import chokidar from "chokidar";
import { sendToRabbitMQ, generateMsgRabbitMQ } from "../rabbitmq/rabbitmq";
import { initRedis, updateData, deleteData, getInode } from "../redis/redis";
import { AmqpParams, WatcherParams, Params, ParamsCheckEvent } from "../types";

const inodesTmp: { [i: number]: string } = {};
const timeoutRefs: { [i: number]: any } = {};
const pathsTmp: { [i: string]: any } = {};

const inits: { path: string; inode: number }[] = [];

let verbose = false;

export const start = (
  rootPathProps: string,
  verboseProps = false,
  rootKey: string,
  amqpParams?: AmqpParams,
  watchParams?: WatcherParams,
) => {
  verbose = verboseProps;

  let ready = false;
  const watcherConfig = (watchParams && watchParams.awaitWriteFinish) || false;
  const timeout = (watchParams && watchParams.timeout) || 2500;

  const watcher = chokidar.watch(rootPathProps, {
    ignored: /(^|[\/\\])\../, //ignore dot file
    ignoreInitial: false, //use init for redis
    alwaysStat: true, //always give stats for add and update event
    awaitWriteFinish: watcherConfig, //wait for copy to finish before trigger event
  });

  watcher.on("all", (event: string, path: string, stats: any) => {
    checkEvent(event, path, stats, {
      ready,
      timeout,
      rootKey,
      amqp: amqpParams,
    });
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
  params: ParamsCheckEvent,
) => {
  const amqp = params.amqp || {};
  let inode: number;

  if (stats) {
    inode = stats.ino;
  } else if (pathsTmp[path]) {
    inode = pathsTmp[path];
  } else {
    inode = await getInode(path);
  }

  if (!params.ready) {
    handleInit(path, inode);
    return;
  }

  if (inodesTmp[inode] && path !== inodesTmp[inode]) {
    //keep the inode
    const oldInode = inodesTmp[inode];

    //cancel other event
    clearTimeout(timeoutRefs[inode]);

    //delay on move event to keep the order of the event
    setTimeout(() => {
      handleEvent(
        "move",
        path,
        inode,
        {
          rootKey: params.rootKey,
          amqp,
        },
        oldInode,
      );
    }, params.timeout);
  } else {
    inodesTmp[inode] = path;
    pathsTmp[path] = inode;
    await delayHandleEvent(event, path, inode, {
      timeout: params.timeout,
      rootKey: params.rootKey,
      amqp,
    });
  }
};

const delayHandleEvent = async (
  event: string,
  path: string,
  inode: number,
  params: ParamsHandleEvent,
) => {
  return new Promise(
    r =>
      (timeoutRefs[inode] = setTimeout(
        () =>
          r(
            handleEvent(event, path, inode, {
              rootKey: params.rootKey,
              amqp: params.amqp,
            }),
          ),
        params.timeout,
      )),
  );
};

export const handleEvent = async (
  event: string,
  path: string,
  inode: number,
  params: Params,
  oldPath?: string,
) => {
  switch (event) {
    case "add":
    case "addDir":
      await handleCreate(path, inode, {
        amqp: params.amqp,
        rootKey: params.rootKey,
      });
      break;
    case "unlink":
    case "unlinkDir":
      await handleDelete(path, inode, {
        amqp: params.amqp,
        rootKey: params.rootKey,
      });
      break;
    case "change":
      await handleUpdate(path, inode, {
        amqp: params.amqp,
        rootKey: params.rootKey,
      });
      break;
    case "move":
      if (oldPath) {
        await handleMove(oldPath, path, inode, {
          amqp: params.amqp,
          rootKey: params.rootKey,
        });
      }
      break;
    default:
      console.error("event not managed : " + event);
      break;
  }

  clearTimeout(timeoutRefs[inode]);
  delete timeoutRefs[inode];
  delete inodesTmp[inode];
  delete pathsTmp[path];
};

export const handleCreate = async (
  path: string,
  inode: number,
  params: Params,
) => {
  await updateData(path, inode);
  sendToRabbitMQ(
    generateMsgRabbitMQ("create", null, path, inode, params.rootKey),
    params.amqp,
  );
  if (verbose) {
    console.info("create", path);
  }
};

export const handleDelete = async (
  path: string,
  inode: number,
  params: Params,
) => {
  await deleteData(path);
  sendToRabbitMQ(
    generateMsgRabbitMQ("delete", path, null, inode, params.rootKey),
    params.amqp,
  );
  if (verbose) {
    console.info("delete", path);
  }
};

export const handleUpdate = async (
  path: string,
  inode: number,
  params: Params,
) => {
  await updateData(path, inode);
  sendToRabbitMQ(
    generateMsgRabbitMQ("update", path, path, inode, params.rootKey),
    params.amqp,
  );
  if (verbose) {
    console.info("update", path);
  }
};

export const handleMove = async (
  pathBefore: string,
  pathAfter: string,
  inode: number,
  params: Params,
) => {
  await updateData(pathAfter, inode, pathBefore);
  sendToRabbitMQ(
    generateMsgRabbitMQ("move", pathBefore, pathAfter, inode, params.rootKey),
    params.amqp,
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

const manageRedisInit = async () => {
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
