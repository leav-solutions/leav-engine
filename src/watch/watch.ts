import * as chokidar from 'chokidar';
import {initRedis, getInode} from '../redis/redis';
import {IAmqpParams, IWatcherParams, IParams, IParamsExtends} from '../types';
import {handleCreate, handleDelete, handleUpdate, handleMove} from './events';

const inodesTmp: {[i: number]: string} = {};
const timeoutRefs: {[i: number]: any} = {};
const pathsTmp: {[i: string]: any} = {};

export const start = async (
    rootPathProps: string,
    rootKey: string,
    watchParams?: IWatcherParams,
    amqpParams?: IAmqpParams
) => {
    const verbose = (watchParams && watchParams.verbose) || false;

    let ready = false;
    const watcherConfig = (watchParams && watchParams.awaitWriteFinish) || false;
    const timeout = (watchParams && watchParams.timeout) || 100;

    // if absolute path given, we use it here to not display the name of the root folder in message
    const cwd = rootPathProps.charAt(0).indexOf('/') === 0 ? rootPathProps : '.';

    const watcher = chokidar.watch(rootPathProps, {
        ignored: /(^|[\/\\])\../, // ignore dot file
        ignoreInitial: false, // use init for redis
        alwaysStat: true, // always give stats for add and update event
        awaitWriteFinish: watcherConfig, // wait for copy to finish before trigger event
        cwd
    });

    watcher.on('all', async (event: string, path: string, stats: any) =>
        checkEvent(event, path, stats, {
            ready,
            timeout,
            rootKey,
            verbose,
            amqp: amqpParams
        })
    );

    watcher.on('ready', () => {
        ready = true;
    });

    return watcher;
};

export const checkEvent = async (event: string, path: string, stats: any, params: IParamsExtends) => {
    if (params.ready) {
        await manageInode(event, path, stats, {
            ready: params.ready,
            timeout: params.timeout,
            rootKey: params.rootKey,
            verbose: params.verbose,
            amqp: params.amqp
        });
    } else {
        handleInit(path, stats.ino, params.verbose);
    }
};
export const manageInode = async (event: string, path: string, stats: any, params: IParamsExtends) => {
    let inode: number;

    if (stats) {
        // Get the inode from the stats (events: add, addDir, Change)
        inode = stats.ino;
    } else if (pathsTmp[path]) {
        // Get the inode from array that keep temporary the inode the time,
        inode = pathsTmp[path];
    } else {
        // Get the inode from redis database
        inode = await getInode(path);
    }

    await checkMove(event, path, stats, inode, params);
};

const checkMove = async (event: string, path: string, stats: any, inode: any, params: IParamsExtends) => {
    const amqp = params.amqp || {};

    if (inodesTmp[inode] && path !== inodesTmp[inode]) {
        // keep the inode
        const oldInode = inodesTmp[inode];

        // save the inode if the next unlink arrive before the create finish to stock data in redis
        pathsTmp[path] = inode;

        // cancel other event
        clearTmp(path, inode);
        // delay on move event to keep the order of the event
        setTimeout(async () => {
            await handleEvent(
                'move',
                path,
                inode,
                {
                    rootKey: params.rootKey,
                    amqp,
                    verbose: params.verbose
                },
                oldInode
            );
        }, params.timeout);
    } else {
        inodesTmp[inode] = path;
        pathsTmp[path] = inode;

        await new Promise(
            resolve =>
                (timeoutRefs[inode] = setTimeout(
                    async () =>
                        resolve(
                            handleEvent(event, path, inode, {
                                rootKey: params.rootKey,
                                verbose: params.verbose,
                                amqp: params.amqp
                            })
                        ),
                    params.timeout
                ))
        );
    }
};

export const handleEvent = async (event: string, path: string, inode: number, params: IParams, oldPath?: string) => {
    const amqp = {
        rootKey: params.rootKey,
        verbose: params.verbose,
        amqp: params.amqp
    };

    switch (event) {
        case 'add':
        case 'addDir':
            await handleCreate(path, inode, amqp);
            break;
        case 'unlink':
        case 'unlinkDir':
            await handleDelete(path, inode, amqp);
            break;
        case 'change':
            await handleUpdate(path, inode, amqp);
            break;
        case 'move':
            if (oldPath) {
                await handleMove(oldPath, path, inode, amqp);
            }
            break;
        default:
            console.error('event not managed : ' + event);
            break;
    }

    clearTmp(path, inode);
};

// Flag to check if already sending inits to redis
let working = false;
// Temporary array of the infos to set in redis at init
const inits: Array<{path: string; inode: number}> = [];

const handleInit = async (path: string, inode: number, verbose: boolean) => {
    inits.push({path, inode}); // add init infos to queue
    manageRedisInit(verbose);
};

const manageRedisInit = async (verbose: boolean) => {
    // if not already working, shit
    if (!working) {
        working = true;

        // while the array of inits is not empty
        while (inits.length > 0) {
            const init = inits.shift();
            if (init) {
                await initRedis(init.path, init.inode); // set data in redis and wait until finish
                if (verbose) {
                    console.info('init', init.path);
                }
            }
        }
        working = false;
    }
};

const clearTmp = (path: string, inode: number) => {
    clearTimeout(timeoutRefs[inode]);
    delete timeoutRefs[inode];
    delete inodesTmp[inode];
    delete pathsTmp[path];
};
