import chokidar from "chokidar";
import { initRedis, getInode } from "../redis/redis";
import { AmqpParams, WatcherParams, Params, ParamsExtends } from "../types";
import { handleCreate, handleDelete, handleUpdate, handleMove } from "./events";

const inodesTmp: { [i: number]: string } = {};
const timeoutRefs: { [i: number]: any } = {};
const pathsTmp: { [i: string]: any } = {};

const inits: { path: string; inode: number }[] = [];

export const start = (
  rootPathProps: string,
  rootKey: string,
  watchParams?: WatcherParams,
  amqpParams?: AmqpParams,
) => {
  const verbose = (watchParams && watchParams.verbose) || false;

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
      verbose,
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
  params: ParamsExtends,
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
    handleInit(path, inode, params.verbose);
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
          verbose: params.verbose,
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
      verbose: params.verbose,
      amqp,
    });
  }
};

const delayHandleEvent = async (
  event: string,
  path: string,
  inode: number,
  params: ParamsExtends,
) => {
  return new Promise(
    r =>
      (timeoutRefs[inode] = setTimeout(
        () =>
          r(
            handleEvent(event, path, inode, {
              rootKey: params.rootKey,
              verbose: params.verbose,
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
  const amqp = {
    rootKey: params.rootKey,
    verbose: params.verbose,
    amqp: params.amqp,
  };

  switch (event) {
    case "add":
    case "addDir":
      await handleCreate(path, inode, amqp);
      break;
    case "unlink":
    case "unlinkDir":
      await handleDelete(path, inode, amqp);
      break;
    case "change":
      await handleUpdate(path, inode, amqp);
      break;
    case "move":
      if (oldPath) {
        await handleMove(oldPath, path, inode, amqp);
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

let working = false;
const handleInit = async (path: string, inode: number, verbose: boolean) => {
  inits.push({ path, inode });
  manageRedisInit(verbose);
};

const manageRedisInit = async (verbose: boolean) => {
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
